-- AlterTable: limit message to 1000 chars
ALTER TABLE "suggestions" ALTER COLUMN "message" TYPE VARCHAR(1000);