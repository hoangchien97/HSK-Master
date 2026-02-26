-- Rename "Vocabulary" table to "portal_vocabulary"
-- Uses exception handling to be idempotent:
--   - On a fresh (shadow) DB: Vocabulary exists after init_v2, gets renamed successfully.
--   - On production: Vocabulary was already renamed by the old migration, so the
--     undefined_table exception is caught and the statement is safely skipped.
DO $$ BEGIN
  ALTER TABLE "Vocabulary" RENAME TO "portal_vocabulary";
EXCEPTION
  WHEN undefined_table THEN NULL;   -- Already renamed or doesn't exist
  WHEN duplicate_table THEN NULL;   -- portal_vocabulary already exists
END $$;
