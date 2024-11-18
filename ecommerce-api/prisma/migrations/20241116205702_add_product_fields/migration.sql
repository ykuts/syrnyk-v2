/*
  Warnings:

  - Added the required column `description_full` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipe` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `umovy` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "assortment" TEXT[],
ADD COLUMN     "description_full" TEXT NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "recipe" TEXT NOT NULL,
ADD COLUMN     "umovy" TEXT NOT NULL,
ADD COLUMN     "weight" TEXT NOT NULL;
