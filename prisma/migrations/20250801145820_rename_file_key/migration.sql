/*
  Warnings:

  - You are about to drop the column `file_key` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "file_key",
ADD COLUMN     "fileKey" TEXT;
