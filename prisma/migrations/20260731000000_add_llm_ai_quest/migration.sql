-- CreateEnum
CREATE TYPE "AiQuestStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "LlmSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'nvidia',
    "model" TEXT,
    "baseUrl" TEXT,
    "apiKeyEncrypted" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LlmSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questTitle" TEXT NOT NULL,
    "cefrLevel" "Level" NOT NULL,
    "theme" TEXT NOT NULL,
    "narrativeHook" TEXT NOT NULL,
    "newStructure" TEXT NOT NULL,
    "challengePrompt" TEXT NOT NULL,
    "hintProgressive" TEXT[],
    "xpBase" INTEGER NOT NULL DEFAULT 50,
    "lootPool" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "streakMultiplierEligible" BOOLEAN NOT NULL DEFAULT true,
    "status" "AiQuestStatus" NOT NULL DEFAULT 'ACTIVE',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AiQuest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LlmSettings_userId_key" ON "LlmSettings"("userId");

-- CreateIndex
CREATE INDEX "AiQuest_userId_createdAt_idx" ON "AiQuest"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "LlmSettings" ADD CONSTRAINT "LlmSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuest" ADD CONSTRAINT "AiQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

