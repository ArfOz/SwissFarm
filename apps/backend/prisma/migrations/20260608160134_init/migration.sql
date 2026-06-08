-- CreateEnum
CREATE TYPE "FarmType" AS ENUM ('milk', 'self-service', 'pick-your-own', 'kids');

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FarmType" NOT NULL,
    "products" TEXT[],
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "website" TEXT,
    "openingHours" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);
