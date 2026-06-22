/*
  Warnings:

  - The primary key for the `farm_payment_methods` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `paymentMethod` on the `farm_payment_methods` table. All the data in the column will be lost.
  - Added the required column `paymentMethodId` to the `farm_payment_methods` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "farm_types" DROP CONSTRAINT "farm_types_farmId_fkey";

-- AlterTable
ALTER TABLE "farm_payment_methods" DROP CONSTRAINT "farm_payment_methods_pkey",
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethodId" TEXT NOT NULL,
ADD CONSTRAINT "farm_payment_methods_pkey" PRIMARY KEY ("farmId", "paymentMethodId");

-- DropEnum
DROP TYPE "FarmType";

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_key" ON "PaymentMethod"("name");

-- AddForeignKey
ALTER TABLE "farm_types" ADD CONSTRAINT "farm_types_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_payment_methods" ADD CONSTRAINT "farm_payment_methods_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
