-- Migration pour ajouter la table VoiceInterview
-- À exécuter manuellement dans votre base de données PostgreSQL

CREATE TABLE "VoiceInterview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "technologies" TEXT[] NOT NULL,
    "context" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "conversationId" TEXT,
    "transcription" JSONB,
    "actualDuration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "feedback" JSONB,
    "score" DOUBLE PRECISION,

    CONSTRAINT "VoiceInterview_pkey" PRIMARY KEY ("id")
);

-- Ajouter la relation avec la table User
ALTER TABLE "VoiceInterview" ADD CONSTRAINT "VoiceInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Créer des index pour améliorer les performances
CREATE INDEX "VoiceInterview_userId_idx" ON "VoiceInterview"("userId");
CREATE INDEX "VoiceInterview_startedAt_idx" ON "VoiceInterview"("startedAt");
CREATE INDEX "VoiceInterview_status_idx" ON "VoiceInterview"("status"); 