/*
  Warnings:

  - Added the required column `derby_id` to the `heat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "heat" ADD COLUMN     "derby_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "heat" ADD CONSTRAINT "heat_derby_id_fkey" FOREIGN KEY ("derby_id") REFERENCES "derby"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
