-- ============================================================
-- V9: Refactor agents table for 1:N User-Agency architecture
-- A single User (human owner) can now own multiple Agencies.
-- ============================================================

-- Step 1: Add the new owner FK column (user_id) if it doesn't exist
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);

-- Step 2: Add agency_name column if it doesn't exist
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255);

-- Step 3: Migrate old data - if there's an agent_id column on users table
--         copy that relationship into the new user_id FK on agents
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'agent_id'
    ) THEN
        -- Copy company_name -> agency_name if company_name exists on agents
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'agents' AND column_name = 'company_name'
        ) THEN
            UPDATE agents a
            SET agency_name = a.company_name
            WHERE a.agency_name IS NULL AND a.company_name IS NOT NULL;
        END IF;

        -- Link existing agents to their owner users via the old agent_id on users
        UPDATE agents a
        SET user_id = u.id
        FROM users u
        WHERE u.agent_id = a.id
          AND a.user_id IS NULL;
    END IF;
END $$;

-- Step 4: Populate agency_name with a default for any nulls (safety net)
UPDATE agents
SET agency_name = 'My Agency'
WHERE agency_name IS NULL;

-- Step 5: Now enforce NOT NULL on agency_name (data is clean)
ALTER TABLE agents
    ALTER COLUMN agency_name SET NOT NULL;

-- Step 6: Drop the old agent_id column from users table if it exists
ALTER TABLE users
    DROP COLUMN IF EXISTS agent_id;

-- Step 7: Drop the old company_name column from agents if it exists
ALTER TABLE agents
    DROP COLUMN IF EXISTS company_name;

-- Step 8: Add useful indexes for the new FK relationship
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
