/*
  Warnings:

  - You are about to drop the column `products` on the `Farm` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Farm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Farm" DROP COLUMN "products",
DROP COLUMN "type";

-- DropEnum
DROP TYPE "FarmType";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmProduct" (
    "farmId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "FarmProduct_pkey" PRIMARY KEY ("farmId","productId")
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
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");

-- AddForeignKey
ALTER TABLE "FarmProduct" ADD CONSTRAINT "FarmProduct_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmProduct" ADD CONSTRAINT "FarmProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmActivity" ADD CONSTRAINT "FarmActivity_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmActivity" ADD CONSTRAINT "FarmActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
