-- V15: Package Types (Single/Multi District) + Hotel Integration
-- ================================================================

-- 1. packages: add package type and per-person pricing
ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_type VARCHAR(20) NOT NULL DEFAULT 'SINGLE_DISTRICT';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS base_price_adult DECIMAL(10,2);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS base_price_child DECIMAL(10,2);

-- 2. package_itinerary: add district + hotel per day (for multi-district)
ALTER TABLE package_itinerary ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE package_itinerary ADD COLUMN IF NOT EXISTS hotel_id BIGINT;
ALTER TABLE package_itinerary ADD COLUMN IF NOT EXISTS hotel_name_custom VARCHAR(255);

-- Add FK constraint for hotel_id
ALTER TABLE package_itinerary DROP CONSTRAINT IF EXISTS fk_itinerary_hotel;
ALTER TABLE package_itinerary ADD CONSTRAINT fk_itinerary_hotel
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- 3. bookings: add accommodation option for single-district bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS accommodation_option VARCHAR(30);
-- Values: 'SELF_ARRANGE', 'AGENCY', or NULL (for multi-district)

-- 4. Backfill existing packages with base_price_adult from price_from
UPDATE packages SET base_price_adult = price_from WHERE base_price_adult IS NULL AND price_from IS NOT NULL;
UPDATE packages SET base_price_child = ROUND(CAST(price_from * 0.5 AS numeric), 2) WHERE base_price_child IS NULL AND price_from IS NOT NULL;
