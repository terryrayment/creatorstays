-- CreateTable
CREATE TABLE "property_manual_blocks" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_manual_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_manual_blocks_propertyId_idx" ON "property_manual_blocks"("propertyId");

-- AddForeignKey
ALTER TABLE "property_manual_blocks" ADD CONSTRAINT "property_manual_blocks_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
