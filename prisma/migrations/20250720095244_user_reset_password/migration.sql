-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isResetPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetPasswordToken" TEXT;
