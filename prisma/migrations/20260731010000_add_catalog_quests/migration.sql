-- AlterTable
ALTER TABLE "AiQuest" ADD COLUMN "catalogId" TEXT;

-- CreateIndex
CREATE INDEX "AiQuest_userId_catalogId_idx" ON "AiQuest"("userId", "catalogId");
