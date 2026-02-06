/*
  Warnings:

  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `google_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `AILog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `debugLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspaceIntegrationConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspaceInvite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspaceMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shopify_customer_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `first_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopify_customer_id` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "chat" DROP CONSTRAINT "chat_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "chatMessage" DROP CONSTRAINT "chatMessage_chatId_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "workspaceIntegrationConnection" DROP CONSTRAINT "workspaceIntegrationConnection_userId_fkey";

-- DropForeignKey
ALTER TABLE "workspaceInvite" DROP CONSTRAINT "workspaceInvite_createdById_fkey";

-- DropForeignKey
ALTER TABLE "workspaceInvite" DROP CONSTRAINT "workspaceInvite_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "workspaceMember" DROP CONSTRAINT "workspaceMember_inviteUsedId_fkey";

-- DropForeignKey
ALTER TABLE "workspaceMember" DROP CONSTRAINT "workspaceMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "workspaceMember" DROP CONSTRAINT "workspaceMember_workspaceId_fkey";

-- DropIndex
DROP INDEX "user_google_id_key";

-- AlterTable: Primeiro deletamos os usuários existentes com Google Auth (serão recriados no Shopify)
DELETE FROM "userSession";
DELETE FROM "user";

-- AlterTable: Agora podemos fazer as alterações
ALTER TABLE "user" DROP COLUMN "createdAt",
DROP COLUMN "google_id",
DROP COLUMN "updatedAt",
ADD COLUMN     "accepts_marketing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "shopify_access_token" TEXT,
ADD COLUMN     "shopify_customer_id" TEXT NOT NULL,
ADD COLUMN     "shopify_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "AILog";

-- DropTable
DROP TABLE "chat";

-- DropTable
DROP TABLE "chatMessage";

-- DropTable
DROP TABLE "debugLog";

-- DropTable
DROP TABLE "organization";

-- DropTable
DROP TABLE "workspace";

-- DropTable
DROP TABLE "workspaceIntegrationConnection";

-- DropTable
DROP TABLE "workspaceInvite";

-- DropTable
DROP TABLE "workspaceMember";

-- DropEnum
DROP TYPE "AILogCategory";

-- DropEnum
DROP TYPE "AIMessageEvaluation";

-- DropEnum
DROP TYPE "DocumentFrom";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "WorkspaceRole";

-- DropEnum
DROP TYPE "WorkspaceType";

-- CreateIndex
CREATE UNIQUE INDEX "user_shopify_customer_id_key" ON "user"("shopify_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_shopify_customer_id_idx" ON "user"("shopify_customer_id");
