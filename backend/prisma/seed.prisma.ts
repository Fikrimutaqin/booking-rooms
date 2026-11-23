import { PrismaClient } from "@prisma/client";
import { UserRole } from "../src/common/enums/user-role.enum";
import { hashPassword } from "../src/common/utils/hash.util";

const prisma = new PrismaClient();

export async function main() {
    /**
     * Seed for Users
     */
    const users = [
        {
            email: 'rpl.11.fikrimutaqin@gmail.com',
            name: 'Fikri Admin',
            password: await hashPassword('Admin123'),
            role: UserRole.ADMIN,
        },
        {
            email: 'rpl.11.fikrimutaqin+1@gmail.com',
            name: 'Fikri Employee',
            password: await hashPassword('Employee123'),
            role: UserRole.EMPLOYEE,
        },
    ];

    // Run query
    await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
    });

    console.log('Users seeded successfully!');

    /**
     * Seed for Rooms
     */
    const rooms = [
        {
            name: 'Room 1',
            location: 'Building A',
            capacity: 10,
            facilities: ['TV', 'Whiteboard'],
            isAvailable: true,
        },
        {
            name: 'Room 2',
            location: 'Building A',
            capacity: 20,
            facilities: ['TV', 'Whiteboard', 'Projector'],
            isAvailable: true,
        },
        {
            name: 'Room 3',
            location: 'Building B',
            capacity: 15,
            facilities: ['TV', 'Whiteboard', 'Projector'],
            isAvailable: true,
        },
        {
            name: 'Room 4',
            location: 'Building B',
            capacity: 25,
            facilities: ['TV', 'Whiteboard', 'Projector'],
            isAvailable: true,
        },
        {
            name: 'Room 5',
            location: 'Building C',
            capacity: 30,
            facilities: ['TV', 'Whiteboard', 'Projector'],
            isAvailable: true,
        },
    ];

    // Run query
    await prisma.room.createMany({
        data: rooms,
        skipDuplicates: true,
    });

    console.log('Rooms seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });