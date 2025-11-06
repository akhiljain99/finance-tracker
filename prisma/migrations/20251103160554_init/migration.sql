/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Expenses` table. All the data in the column will be lost.
  - Added the required column `category` to the `Expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Expenses" DROP CONSTRAINT "Expenses_categoryId_fkey";

-- AlterTable
ALTER TABLE "Expenses" DROP COLUMN "categoryId",
ADD COLUMN     "category" TEXT NOT NULL;
