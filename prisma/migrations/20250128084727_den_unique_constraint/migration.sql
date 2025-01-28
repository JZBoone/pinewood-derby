/*
  Warnings:

  - A unique constraint covering the columns `[derby_id,name]` on the table `den` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_derby_id_name" ON "den"("derby_id", "name");
