-- V11: Drop the image_url column from the hotels table
-- Run this only after confirming V10 migration and all code references are removed.
-- ALTER TABLE hotels DROP COLUMN image_url;

-- NOTE: This migration is intentionally a no-op / comment-only for now.
-- Uncomment the ALTER TABLE line above when ready to permanently drop the column.
SELECT 1;
