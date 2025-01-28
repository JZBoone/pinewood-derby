/*
  Warnings:

  - You are about to drop the column `dirby_id` on the `den` table. All the data in the column will be lost.
  - Added the required column `derby_id` to the `den` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "den" DROP CONSTRAINT "den_dirby_id_fkey";

-- AlterTable
ALTER TABLE "den" DROP COLUMN "dirby_id",
ADD COLUMN     "derby_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "den" ADD CONSTRAINT "den_derby_id_fkey" FOREIGN KEY ("derby_id") REFERENCES "derby"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
