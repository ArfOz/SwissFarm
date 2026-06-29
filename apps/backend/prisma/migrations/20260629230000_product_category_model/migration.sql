-- Create ProductCategory model from enum
-- Step 1: Create product_categories table
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- Step 2: Insert default categories from the ProductCategory enum values
INSERT INTO "product_categories" ("id", "name") VALUES
    ('cat_milk', 'milk'),
    ('cat_fruit', 'fruit'),
    ('cat_vegetable', 'vegetable'),
    ('cat_honey', 'honey'),
    ('cat_egg', 'egg'),
    ('cat_meat', 'meat'),
    ('cat_other', 'other');

-- Step 3: Add categoryId column (nullable initially)
ALTER TABLE "products" ADD COLUMN "categoryId" TEXT;

-- Step 4: Update existing products to link to their correct category (cast enum to text)
UPDATE "products" p
SET "categoryId" = pc."id"
FROM "product_categories" pc
WHERE pc."name" = p."category"::text;

-- Step 5: Make categoryId NOT NULL (all rows should now have a categoryId)
ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL;

-- Step 6: Add foreign key constraint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Drop the old category column (was an enum)
ALTER TABLE "products" DROP COLUMN "category";

-- Step 8: Add unique index on name
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- Step 9: Add index on categoryId for better query performance
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- Note: The ProductCategory enum type will remain in the database but will no longer be used.
-- It can be cleaned up later with: DROP TYPE IF EXISTS "ProductCategory";