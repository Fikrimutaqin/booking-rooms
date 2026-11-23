/*
  Warnings:

  - You are about to drop the column `createdAt` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `end_at` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_at` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_roomId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_userId_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "createdAt",
DROP COLUMN "endTime",
DROP COLUMN "roomId",
DROP COLUMN "startTime",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "room_id" TEXT NOT NULL,
ADD COLUMN     "start_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "bookings_room_id_start_at_end_at_idx" ON "bookings"("room_id", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_end_after_start" CHECK ("end_at" > "start_at");

ALTER TABLE "bookings"
  ADD CONSTRAINT "no_overlapping_bookings"
  EXCLUDE USING gist (
    "room_id" WITH =,
    tstzrange("start_at", "end_at") WITH &&
  );
