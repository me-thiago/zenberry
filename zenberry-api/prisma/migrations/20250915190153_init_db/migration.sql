-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PDF', 'MARKDOWN', 'TEXT', 'IMAGE', 'CODE');

-- CreateEnum
CREATE TYPE "DocumentFrom" AS ENUM ('HUMAN', 'AI');

-- CreateEnum
CREATE TYPE "AIMessageEvaluation" AS ENUM ('POSITIVE', 'NEGATIVE', 'UNDEFINED');

-- CreateEnum
CREATE TYPE "AILogCategory" AS ENUM ('TEXT_MESSAGE_GENERATION', 'AUDIO_MESSAGE_GENERATION', 'AUDIO_MESSAGE_TRANSCRIPTION', 'CLONE_VOICE', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('DEFAULT', 'DEPLOYER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AILog" (
    "id" TEXT NOT NULL,
    "category" "AILogCategory" NOT NULL,
    "tokenAmount" INTEGER NOT NULL,
    "data" TEXT,
    "fromUserId" TEXT NOT NULL,
    "executorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AILog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "WorkspaceType" NOT NULL DEFAULT 'DEFAULT',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaceMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "inviteUsedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "workspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaceInvite" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT,
    "code" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaceInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaceIntegrationConnection" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "entityId" TEXT NOT NULL,
    "name" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "workspaceIntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debugLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,
    "errorStack" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debugLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappConfiguration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "fromApp" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "WhatsappConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsappChatMessage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "fromApp" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_address_key" ON "user"("address");

-- CreateIndex
CREATE UNIQUE INDEX "userSession_token_key" ON "userSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "workspaceMember_userId_workspaceId_key" ON "workspaceMember"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspaceInvite_code_key" ON "workspaceInvite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "workspaceInvite_workspaceId_code_key" ON "workspaceInvite"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "workspaceIntegrationConnection_integrationId_isActive_idx" ON "workspaceIntegrationConnection"("integrationId", "isActive");

-- CreateIndex
CREATE INDEX "workspaceIntegrationConnection_userId_isActive_idx" ON "workspaceIntegrationConnection"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "workspaceIntegrationConnection_integrationId_userId_entityI_key" ON "workspaceIntegrationConnection"("integrationId", "userId", "entityId");

-- CreateIndex
CREATE INDEX "whatsappChatMessage_workspaceId_phoneNumber_fromApp_created_idx" ON "whatsappChatMessage"("workspaceId", "phoneNumber", "fromApp", "createdAt");

-- AddForeignKey
ALTER TABLE "userSession" ADD CONSTRAINT "userSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceMember" ADD CONSTRAINT "workspaceMember_inviteUsedId_fkey" FOREIGN KEY ("inviteUsedId") REFERENCES "workspaceInvite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceMember" ADD CONSTRAINT "workspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceMember" ADD CONSTRAINT "workspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceInvite" ADD CONSTRAINT "workspaceInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "workspaceMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceInvite" ADD CONSTRAINT "workspaceInvite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceIntegrationConnection" ADD CONSTRAINT "workspaceIntegrationConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappConfiguration" ADD CONSTRAINT "WhatsappConfiguration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsappChatMessage" ADD CONSTRAINT "whatsappChatMessage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
