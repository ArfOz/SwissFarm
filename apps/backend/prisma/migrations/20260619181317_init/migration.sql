-- CreateEnum
CREATE TYPE "FarmType" AS ENUM ('milk', 'self_service', 'pick_your_own', 'kids');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('twint', 'cash', 'credit_card', 'invoice');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FarmType" NOT NULL DEFAULT 'milk',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmProduct" (
    "farmId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "FarmProduct_pkey" PRIMARY KEY ("farmId","productId")
);

-- CreateTable
CREATE TABLE "OpeningHour" (
    "id" TEXT NOT NULL,
    "day" "Weekday" NOT NULL,
    "open" TEXT,
    "close" TEXT,

    CONSTRAINT "OpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmOpeningHour" (
    "farmId" TEXT NOT NULL,
    "openingHourId" TEXT NOT NULL,

    CONSTRAINT "FarmOpeningHour_pkey" PRIMARY KEY ("farmId","openingHourId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_payment_methods" (
    "farmId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,

    CONSTRAINT "farm_payment_methods_pkey" PRIMARY KEY ("farmId","paymentMethod")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmActivity" (
    "farmId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "FarmActivity_pkey" PRIMARY KEY ("farmId","activityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");

-- AddForeignKey
ALTER TABLE "FarmProduct" ADD CONSTRAINT "FarmProduct_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmProduct" ADD CONSTRAINT "FarmProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmOpeningHour" ADD CONSTRAINT "FarmOpeningHour_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmOpeningHour" ADD CONSTRAINT "FarmOpeningHour_openingHourId_fkey" FOREIGN KEY ("openingHourId") REFERENCES "OpeningHour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_payment_methods" ADD CONSTRAINT "farm_payment_methods_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmActivity" ADD CONSTRAINT "FarmActivity_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmActivity" ADD CONSTRAINT "FarmActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
