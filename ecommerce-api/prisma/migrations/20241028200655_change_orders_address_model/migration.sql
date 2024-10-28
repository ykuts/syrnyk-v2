/*
  Warnings:

  - You are about to drop the column `country` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Address` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropIndex
DROP INDEX "Address_userId_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "country",
DROP COLUMN "isDefault",
DROP COLUMN "state",
DROP COLUMN "street",
DROP COLUMN "userId",
DROP COLUMN "zipCode",
ADD COLUMN     "station" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discount" DECIMAL(10,2);
