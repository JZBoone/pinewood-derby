-- CreateTable
CREATE TABLE "car" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "den_id" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "number" SMALLINT NOT NULL,
    "superlative" TEXT,
    "name" TEXT,

    CONSTRAINT "car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "den" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "derby_id" INTEGER NOT NULL,

    CONSTRAINT "den_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "derby" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "time" TIMESTAMP(6) NOT NULL,
    "location_name" TEXT NOT NULL,

    CONSTRAINT "derby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heat" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "den_id" INTEGER NOT NULL,
    "lane_1_car_id" INTEGER,
    "lane_2_car_id" INTEGER,
    "lane_3_car_id" INTEGER,
    "lane_4_car_id" INTEGER,
    "lane_5_car_id" INTEGER,
    "lane_6_car_id" INTEGER,
    "lane_1_car_time" SMALLINT,
    "lane_2_car_time" SMALLINT,
    "lane_3_car_time" SMALLINT,
    "lane_4_car_time" SMALLINT,
    "lane_5_car_time" SMALLINT,
    "lane_6_car_time" SMALLINT,
    "raced_at" TIMESTAMP(6),

    CONSTRAINT "heat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_derby_id_name" ON "den"("derby_id", "name");

-- AddForeignKey
ALTER TABLE "car" ADD CONSTRAINT "car_den_id_fkey" FOREIGN KEY ("den_id") REFERENCES "den"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "den" ADD CONSTRAINT "den_derby_id_fkey" FOREIGN KEY ("derby_id") REFERENCES "derby"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "heat" ADD CONSTRAINT "heat_den_id_fkey" FOREIGN KEY ("den_id") REFERENCES "den"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "heat" ADD CONSTRAINT "heat_lane_1_car_id_fkey" FOREIGN KEY ("lane_1_car_id") REFERENCES "car"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "heat" ADD CONSTRAINT "heat_lane_2_car_id_fkey" FOREIGN KEY ("lane_2_car_id") REFERENCES "car"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "heat" ADD CONSTRAINT "heat_lane_3_car_id_fkey" FOREIGN KEY ("lane_3_car_id") REFERENCES "car"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "heat" ADD CONSTRAINT "heat_lane_4_car_id_fkey" FOREIGN KEY ("lane_4_car_id") REFERENCES "car"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "heat" ADD CONSTRAINT "heat_lane_5_car_id_fkey" FOREIGN KEY ("lane_5_car_id") REFERENCES "car"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "heat" ADD CONSTRAINT "heat_lane_6_car_id_fkey" FOREIGN KEY ("lane_6_car_id") REFERENCES "car"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
