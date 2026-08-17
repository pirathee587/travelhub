-- Add NIC Front and Rear Image columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS nic_front_image VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nic_rear_image VARCHAR(255);
