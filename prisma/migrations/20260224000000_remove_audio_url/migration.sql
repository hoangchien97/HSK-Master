-- Remove audioUrl column from portal_vocabulary table
-- Web Speech API is used for pronunciation instead of audio files
ALTER TABLE "portal_vocabulary" DROP COLUMN IF EXISTS "audioUrl";
