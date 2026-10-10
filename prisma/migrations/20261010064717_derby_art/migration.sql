-- CreateTable
CREATE TABLE "derby_art" (
    "derby_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image_data" BYTEA,
    "image_type" TEXT,
    "image_path" TEXT,
    "title" TEXT,
    "artist" TEXT,
    "den" TEXT,
    "bg_color" TEXT,

    CONSTRAINT "derby_art_pkey" PRIMARY KEY ("derby_id")
);

-- AddForeignKey
ALTER TABLE "derby_art" ADD CONSTRAINT "derby_art_derby_id_fkey" FOREIGN KEY ("derby_id") REFERENCES "derby"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Seed the featured art the derby pages showed before this table existed
-- (public/logo-{id}.png). Skipped where those derbies don't exist.
INSERT INTO "derby_art" ("derby_id", "image_path", "bg_color")
SELECT 2, '/logo-2.png', '#8b2424' WHERE EXISTS (SELECT 1 FROM "derby" WHERE "id" = 2);
INSERT INTO "derby_art" ("derby_id", "image_path", "bg_color")
SELECT 3, '/logo-3.png', '#132150' WHERE EXISTS (SELECT 1 FROM "derby" WHERE "id" = 3);
