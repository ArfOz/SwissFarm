-- CreateTable: suggestions
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "userId" TEXT,
    "author" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "photo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "suggestions_farmId_idx" ON "suggestions"("farmId");
CREATE INDEX "suggestions_status_idx" ON "suggestions"("status");

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;