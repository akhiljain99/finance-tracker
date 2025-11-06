/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Expenses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Expenses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Goals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Goals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `Goals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Income` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Income` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `Income` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `categoryId` on the `Expenses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Expenses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `incomeType` to the `Income` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Expenses" DROP CONSTRAINT "Expenses_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Expenses" DROP CONSTRAINT "Expenses_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Goals" DROP CONSTRAINT "Goals_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Income" DROP CONSTRAINT "Income_userId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Expenses" DROP CONSTRAINT "Expenses_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Goals" DROP CONSTRAINT "Goals_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER,
ADD CONSTRAINT "Goals_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Income" DROP CONSTRAINT "Income_pkey",
ADD COLUMN     "incomeType" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER,
ADD CONSTRAINT "Income_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goals" ADD CONSTRAINT "Goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
