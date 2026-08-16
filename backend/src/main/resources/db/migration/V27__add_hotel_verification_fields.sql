ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS nic_rear_image_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_registration_image_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(255);
