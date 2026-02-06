/*
  Warnings:

  - You are about to drop the column `userId` on the `product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_userId_fkey";

-- DropIndex
DROP INDEX "product_userId_idx";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "userId";
