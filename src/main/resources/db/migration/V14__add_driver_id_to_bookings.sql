-- V14: Add driver_id foreign key to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_id BIGINT;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_booking_driver;
ALTER TABLE bookings ADD CONSTRAINT fk_booking_driver
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
