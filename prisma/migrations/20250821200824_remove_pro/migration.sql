/*
  Warnings:

  - The values [PROFESSIONAL] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isAlreadyAUser` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `HealthEntry` table. All the data in the column will be lost.
  - You are about to drop the column `fatigue` on the `HealthEntry` table. All the data in the column will be lost.
  - You are about to drop the column `mood` on the `HealthEntry` table. All the data in the column will be lost.
  - You are about to drop the column `painLevel` on the `HealthEntry` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SharedAccessToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contactName` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `global` to the `HealthEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mental` to the `HealthEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `physical` to the `HealthEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `note` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('PATIENT', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";

-- DropForeignKey
ALTER TABLE "SharedAccessToken" DROP CONSTRAINT "SharedAccessToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Treatment" DROP CONSTRAINT "Treatment_createdById_fkey";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "isAlreadyAUser",
DROP COLUMN "name",
DROP COLUMN "nickname",
ADD COLUMN     "contactName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HealthEntry" DROP COLUMN "comment",
DROP COLUMN "fatigue",
DROP COLUMN "mood",
DROP COLUMN "painLevel",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "feeling" TEXT,
ADD COLUMN     "global" INTEGER NOT NULL,
ADD COLUMN     "links" TEXT,
ADD COLUMN     "mental" INTEGER NOT NULL,
ADD COLUMN     "physical" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "content",
DROP COLUMN "createdAt",
ADD COLUMN     "note" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Treatment" ADD COLUMN     "DuringEvening" BOOLEAN,
ADD COLUMN     "DuringMeal" BOOLEAN,
ADD COLUMN     "DuringMidday" BOOLEAN,
ADD COLUMN     "DuringMorning" BOOLEAN,
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "frequency" INTEGER,
ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "Follow";

-- DropTable
DROP TABLE "Reminder";

-- DropTable
DROP TABLE "SharedAccessToken";
