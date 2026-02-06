/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,phoneNumber]` on the table `WhatsappConfiguration` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WhatsappConfiguration" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "appSecret" TEXT,
ADD COLUMN     "phoneNumberId" TEXT;

-- CreateIndex
CREATE INDEX "WhatsappConfiguration_phoneNumber_idx" ON "WhatsappConfiguration"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappConfiguration_workspaceId_phoneNumber_key" ON "WhatsappConfiguration"("workspaceId", "phoneNumber");
