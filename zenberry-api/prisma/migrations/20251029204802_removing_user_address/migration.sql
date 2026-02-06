/*
  Warnings:

  - You are about to drop the column `address` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_address_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "address";

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "size" TEXT,
    "flavor" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "effects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits" TEXT,
    "ingredients" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_userId_idx" ON "product"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
