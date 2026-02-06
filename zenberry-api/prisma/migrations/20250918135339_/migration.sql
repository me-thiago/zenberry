/*
  Warnings:

  - You are about to drop the column `customerId` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `chatMessage` table. All the data in the column will be lost.
  - You are about to drop the `WhatsappConfiguration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `whatsappChatMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WhatsappConfiguration" DROP CONSTRAINT "WhatsappConfiguration_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "chat" DROP CONSTRAINT "chat_customerId_fkey";

-- DropForeignKey
ALTER TABLE "customer" DROP CONSTRAINT "customer_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "whatsappChatMessage" DROP CONSTRAINT "whatsappChatMessage_workspaceId_fkey";

-- AlterTable
ALTER TABLE "chat" DROP COLUMN "customerId",
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "chatMessage" DROP COLUMN "messageId";

-- DropTable
DROP TABLE "WhatsappConfiguration";

-- DropTable
DROP TABLE "customer";

-- DropTable
DROP TABLE "whatsappChatMessage";
