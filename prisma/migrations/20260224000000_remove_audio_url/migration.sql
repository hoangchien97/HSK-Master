-- Remove audioUrl column from portal_vocabulary table
-- Web Speech API is used for pronunciation instead of audio files
-- Uses DO block so it's safe on both fresh and existing databases
DO $$ BEGIN
  ALTER TABLE "portal_vocabulary" DROP COLUMN IF EXISTS "audioUrl";
EXCEPTION
  WHEN undefined_table THEN NULL; -- Table doesn't exist yet, skip
END $$;
