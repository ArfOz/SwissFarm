-- Create FarmType junction table
CREATE TABLE "farm_types" (
    "farmId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "farm_types_pkey" PRIMARY KEY ("farmId", "type")
);

-- Add foreign key
ALTER TABLE "farm_types" ADD CONSTRAINT "farm_types_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- Migrate existing data: create a row in farm_types for each farm's type
INSERT INTO "farm_types" ("farmId", "type")
SELECT "id", "type" FROM "Farm";

-- Drop old type column
ALTER TABLE "Farm" DROP COLUMN "type";