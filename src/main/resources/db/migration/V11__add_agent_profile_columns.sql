-- ============================================================
-- V11: Add all new profile columns to agents table
-- These match the Agent.java entity fields added in the refactor.
-- ============================================================

-- Contact columns
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agency_number     VARCHAR(50);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS secondary_number  VARCHAR(50);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS whatsapp_number   VARCHAR(50);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS location          VARCHAR(255);

-- Profile/bio columns
ALTER TABLE agents ADD COLUMN IF NOT EXISTS bio               TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS languages         VARCHAR(255);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS operating_districts VARCHAR(500);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS website_url       VARCHAR(500);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS member_since      DATE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS submitted_date    TIMESTAMP;

-- Stats columns
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rating            DOUBLE PRECISION;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS total_trips       INTEGER;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS total_revenue     INTEGER;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS experience_years  INTEGER;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS completion_rate   DOUBLE PRECISION;
