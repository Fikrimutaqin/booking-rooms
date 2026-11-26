import { PrismaClient, BookingStatus } from '@prisma/client';
import { BookingsService } from '../src/bookings/bookings.service';
import { CreateBookingDto } from '../src/bookings/dto/create-booking.dto';

/**
 * Concurrency Integration Test Suite
 * Description: Sends 20 concurrent booking requests simultaneously for the exact same room and time slot,
 * proving that PostgreSQL GiST exclusion constraint and NestJS service prevent double-booking,
 * allowing strictly 1 successful booking and rejecting the other 19 with 409 Conflict.
 */

const prisma = new PrismaClient();

// Helper to format ISO with WIB offset for proper validation
function createWibIsoTime(dateStr: string, hour: number, minute: number = 0): Date {
  const pad = (n: number) => String(n).padStart(2, '0');
  // UTC+7 representation
  return new Date(`${dateStr}T${pad(hour)}:${pad(minute)}:00+07:00`);
}

async function runConcurrencyTest() {
  console.log('\n===============================================================');
  console.log('⚡ STARTING CONCURRENCY INTEGRATION TEST: 20 SIMULTANEOUS BOOKINGS');
  console.log('===============================================================\n');

  // 1. Fetch valid user and room
  const user = await prisma.user.findFirst({
    where: { role: 'EMPLOYEE' },
  }) || await prisma.user.findFirst();

  const room = await prisma.room.findFirst({
    where: { isAvailable: true },
  }) || await prisma.room.findFirst();

  if (!user || !room) {
    throw new Error('❌ Test setup failed: Need at least one User and one Room in the database.');
  }

  console.log(`👤 Test User: ${user.name} (${user.email}) [ID: ${user.id}]`);
  console.log(`🚪 Test Room: ${room.name} (Capacity: ${room.capacity}) [ID: ${room.id}]`);

  // 2. Select a pristine future weekday for testing (e.g. 2026-12-15 is a Tuesday)
  const testDateStr = '2026-12-15';
  const startAt = createWibIsoTime(testDateStr, 14, 0); // 14:00 WIB (07:00 UTC)
  const endAt = createWibIsoTime(testDateStr, 15, 0);   // 15:00 WIB (08:00 UTC)

  console.log(`📅 Target Date & Time: ${testDateStr}, 14:00 - 15:00 WIB`);
  console.log(`🌐 Canonical UTC: ${startAt.toISOString()} -> ${endAt.toISOString()}`);

  // 3. Clean up any existing records for this specific slot prior to test
  await prisma.booking.deleteMany({
    where: {
      roomId: room.id,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  // 4. Instantiate BookingsService
  const bookingsService = new BookingsService(prisma as any);

  const CONCURRENT_REQUESTS_COUNT = 20;
  console.log(`\n🚀 Firing ${CONCURRENT_REQUESTS_COUNT} concurrent booking requests simultaneously via Promise.allSettled...\n`);

  const startTime = Date.now();

  // Create 20 distinct payload requests
  const requests = Array.from({ length: CONCURRENT_REQUESTS_COUNT }, (_, index) => {
    const requestNumber = index + 1;
    const dto: CreateBookingDto = {
      roomId: room.id,
      title: `Concurrent Meeting #${requestNumber}`,
      startAt,
      endAt,
    };
    return bookingsService.create(user.id, dto);
  });

  // Fire all 20 requests at the exact same millisecond
  const results = await Promise.allSettled(requests);
  const durationMs = Date.now() - startTime;

  // 5. Analyze Results
  const fulfilled = results.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<any>[];
  const rejected = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];

  console.log('---------------------------------------------------------------');
  console.log(`⏱️ Execution Time: ${durationMs} ms`);
  console.log(`✅ Succeeded (Fulfilled): ${fulfilled.length}`);
  console.log(`❌ Rejected (Conflicts):  ${rejected.length}`);
  console.log('---------------------------------------------------------------\n');

  // Print individual request status log
  results.forEach((res, i) => {
    const reqNum = String(i + 1).padStart(2, '0');
    if (res.status === 'fulfilled') {
      const val = res.value as any;
      console.log(`  [Request #${reqNum}] ✅ SUCCESS: Booking ID ${val.id} ("${val.title}")`);
    } else {
      const errorMsg = res.reason?.message || res.reason?.toString() || 'Conflict error';
      console.log(`  [Request #${reqNum}] ❌ REJECTED: ${errorMsg}`);
    }
  });

  // 6. Direct Database Row Verification
  const dbCount = await prisma.booking.count({
    where: {
      roomId: room.id,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      status: { not: BookingStatus.CANCELLED },
    },
  });

  console.log('\n📊 DATABASE INTEGRITY AUDIT:');
  console.log(`   Actual rows persisted in PostgreSQL: ${dbCount}`);

  // 7. Assertions
  const assertionsPassed =
    fulfilled.length === 1 &&
    rejected.length === CONCURRENT_REQUESTS_COUNT - 1 &&
    dbCount === 1;

  if (assertionsPassed) {
    console.log('\n🎉 ===============================================================');
    console.log('🏆 CONCURRENCY TEST PASSED PERFECTLY!');
    console.log('   - Exactly 1 out of 20 requests successfully acquired the room.');
    console.log(`   - Exactly 19 requests were rejected with Conflict.`);
    console.log('   - Zero race conditions or double-bookings occurred in the database.');
    console.log('===============================================================\n');
  } else {
    console.error('\n🚨 ===============================================================');
    console.error('💥 CONCURRENCY TEST FAILED!');
    console.error(`   Expected 1 success and ${CONCURRENT_REQUESTS_COUNT - 1} rejections, but got:`);
    console.error(`   Successes: ${fulfilled.length}, Rejections: ${rejected.length}, Persisted in DB: ${dbCount}`);
    console.error('===============================================================\n');
  }

  // 8. Clean up created test booking
  if (fulfilled.length > 0) {
    await prisma.booking.deleteMany({
      where: {
        roomId: room.id,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });
    console.log('🧹 Cleaned up temporary test booking records from database.\n');
  }

  if (!assertionsPassed) {
    process.exit(1);
  }
}

runConcurrencyTest()
  .catch((err) => {
    console.error('❌ Fatal error in concurrency test:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
