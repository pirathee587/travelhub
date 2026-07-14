-- ============================================================
-- V10: Add missing columns to users table (nic_image, nic_number)
-- and ensure agents table has user_id + agency_name columns.
-- ============================================================

-- Add nic_number column to users if it doesn't exist
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS nic_number VARCHAR(255);

-- Add nic_image column to users if it doesn't exist
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS nic_image VARCHAR(500);

-- Ensure agents table has the new ownership FK column
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);

-- Ensure agents table has agency_name column
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255);

-- Migrate old data: copy company_name -> agency_name if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'company_name'
    ) THEN
        UPDATE agents
        SET agency_name = company_name
        WHERE agency_name IS NULL AND company_name IS NOT NULL;
    END IF;
END $$;

-- Migrate old data: link agents to owner users via old agent_id on users table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'agent_id'
    ) THEN
        UPDATE agents a
        SET user_id = u.id
        FROM users u
        WHERE u.agent_id = a.id
          AND a.user_id IS NULL;
    END IF;
END $$;

-- Set a default agency_name for any remaining nulls
UPDATE agents
SET agency_name = 'My Agency'
WHERE agency_name IS NULL;

-- Drop old agent_id column from users if it exists
ALTER TABLE users
    DROP COLUMN IF EXISTS agent_id;

-- Drop old company_name column from agents if it exists
ALTER TABLE agents
    DROP COLUMN IF EXISTS company_name;

-- Index for fast agent lookup by owner
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
