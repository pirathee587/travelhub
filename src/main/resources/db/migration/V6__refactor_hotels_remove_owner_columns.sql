-- Drop redundant owner identity columns from hotels table.
-- Owner information now comes from the users table via owner_id (FK).
-- Columns were already dropped manually via Supabase SQL editor in Step 1.
-- This migration file exists only to keep Flyway schema history in sync.

ALTER TABLE hotels DROP COLUMN IF EXISTS owner_name;
ALTER TABLE hotels DROP COLUMN IF EXISTS owner_email;
ALTER TABLE hotels DROP COLUMN IF EXISTS owner_nic;
ALTER TABLE hotels DROP COLUMN IF EXISTS nic_image_url;
