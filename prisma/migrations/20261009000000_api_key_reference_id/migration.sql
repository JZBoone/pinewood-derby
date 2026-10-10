-- better-auth 1.7 moved the api-key plugin to @better-auth/api-key, which
-- renames userId to referenceId and adds configId. Rename instead of
-- drop/add so existing keys keep working.

-- RenameColumn
ALTER TABLE "apikey" RENAME COLUMN "userId" TO "referenceId";

-- RenameForeignKey
ALTER TABLE "apikey" RENAME CONSTRAINT "apikey_userId_fkey" TO "apikey_referenceId_fkey";

-- RenameIndex
ALTER INDEX "apikey_userId_idx" RENAME TO "apikey_referenceId_idx";

-- AlterTable
ALTER TABLE "apikey" ADD COLUMN "configId" TEXT NOT NULL DEFAULT 'default';

-- CreateIndex
CREATE INDEX "apikey_configId_idx" ON "apikey"("configId");
