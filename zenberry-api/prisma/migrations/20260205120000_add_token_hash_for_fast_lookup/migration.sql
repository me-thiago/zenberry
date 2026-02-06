-- AlterTable: Add token hash column for O(1) lookup
-- This replaces the O(N) bcrypt scan with indexed SHA-256 lookup
ALTER TABLE "user" ADD COLUMN "shopify_token_hash" TEXT;

-- CreateIndex: Index for fast token lookup
CREATE INDEX "user_shopify_token_hash_idx" ON "user"("shopify_token_hash");
