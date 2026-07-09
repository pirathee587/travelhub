-- Create vehicle_owners table
CREATE TABLE IF NOT EXISTS vehicle_owners (
    id BIGSERIAL PRIMARY KEY,
    agent_id BIGINT REFERENCES agents(id),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    nic_number VARCHAR(255) UNIQUE,
    nic_front_image VARCHAR(500),
    nic_rear_image VARCHAR(500),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    mobile_number VARCHAR(255),
    secondary_mobile_number VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extract existing owner details from vehicles to vehicle_owners (avoiding duplicates on nic_number)
INSERT INTO vehicle_owners (agent_id, first_name, last_name, nic_number, nic_front_image, nic_rear_image, address_line1, address_line2, mobile_number, secondary_mobile_number, email)
SELECT DISTINCT 
    CASE WHEN EXISTS (SELECT 1 FROM agents a WHERE a.id = v.agent_id) THEN v.agent_id ELSE NULL END,
    v.owner_first_name, v.owner_last_name, v.nic_number, v.nic_front_image, v.nic_rear_image, v.address_line1, v.address_line2, v.mobile_number, v.secondary_mobile_number, v.owner_email
FROM vehicles v
WHERE v.nic_number IS NOT NULL AND v.nic_number != ''
ON CONFLICT (nic_number) DO NOTHING;

-- Add owner_id foreign key column to vehicles if it doesn't exist
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_id BIGINT REFERENCES vehicle_owners(id);

-- Update vehicles to point to the newly created owner records
UPDATE vehicles v
SET owner_id = o.id
FROM vehicle_owners o
WHERE v.nic_number = o.nic_number;

-- Drop deprecated columns from vehicles table
ALTER TABLE vehicles DROP COLUMN IF EXISTS owner_first_name;
ALTER TABLE vehicles DROP COLUMN IF EXISTS owner_last_name;
ALTER TABLE vehicles DROP COLUMN IF EXISTS nic_number;
ALTER TABLE vehicles DROP COLUMN IF EXISTS nic_front_image;
ALTER TABLE vehicles DROP COLUMN IF EXISTS nic_rear_image;
ALTER TABLE vehicles DROP COLUMN IF EXISTS address_line1;
ALTER TABLE vehicles DROP COLUMN IF EXISTS address_line2;
ALTER TABLE vehicles DROP COLUMN IF EXISTS mobile_number;
ALTER TABLE vehicles DROP COLUMN IF EXISTS secondary_mobile_number;
ALTER TABLE vehicles DROP COLUMN IF EXISTS owner_email;
