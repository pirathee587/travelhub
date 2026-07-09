-- Drop hotel_id from users table to normalize the One-to-Many ownership relationship
ALTER TABLE users DROP COLUMN IF EXISTS hotel_id;
