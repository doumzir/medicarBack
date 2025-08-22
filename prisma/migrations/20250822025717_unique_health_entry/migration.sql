/*
  Warnings:

  - A unique constraint covering the columns `[userId,createdAt]` on the table `HealthEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HealthEntry_userId_createdAt_key" ON "HealthEntry"("userId", "createdAt");
