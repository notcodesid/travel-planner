-- CreateTable
CREATE TABLE "public"."trip" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "budget_band" TEXT NOT NULL,
    "pace" TEXT NOT NULL,
    "food_prefs" TEXT[],
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trip_day" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "day_index" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trip_stop" (
    "id" TEXT NOT NULL,
    "day_id" TEXT NOT NULL,
    "stop_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT,
    "start_time" TEXT,
    "duration_mins" INTEGER,
    "est_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_stop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trip_day_trip_id_day_index_key" ON "public"."trip_day"("trip_id", "day_index");

-- CreateIndex
CREATE UNIQUE INDEX "trip_stop_day_id_stop_index_key" ON "public"."trip_stop"("day_id", "stop_index");

-- AddForeignKey
ALTER TABLE "public"."trip_day" ADD CONSTRAINT "trip_day_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trip_stop" ADD CONSTRAINT "trip_stop_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "public"."trip_day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
