/*
  Warnings:

  - You are about to drop the column `links` on the `HealthEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HealthEntry" DROP COLUMN "links",
ADD COLUMN     "limbs" TEXT;
