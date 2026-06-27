-- Remove legacy column and link agents to users
ALTER TABLE agents ADD COLUMN user_id BIGINT REFERENCES users(id);
ALTER TABLE agents ADD COLUMN agency_name VARCHAR(255);

-- Drop legacy columns
ALTER TABLE users DROP COLUMN IF EXISTS agent_id;
ALTER TABLE agents DROP COLUMN IF EXISTS company_name;
ALTER TABLE agents DROP COLUMN IF EXISTS nic_image_url;
ALTER TABLE agents DROP COLUMN IF EXISTS application_status;

-- Add verification details to users
ALTER TABLE users ADD COLUMN nic_number VARCHAR(255);
ALTER TABLE users ADD COLUMN nic_image VARCHAR(500);
