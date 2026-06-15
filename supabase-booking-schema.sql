-- ============================================
-- BOOKING SCHEMA - Complete Setup
-- ============================================

-- 1. Add missing column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS hotel_ids_with_preference TEXT;

-- 2. Create booking_hotel_preferences table (normalized preferences with order)
CREATE TABLE IF NOT EXISTS booking_hotel_preferences (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    preference_number INTEGER NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
    
    -- Unique constraint: one preference_number per booking
    UNIQUE (booking_id, preference_number)
);

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_booking_hotel_preferences_booking_id 
ON booking_hotel_preferences(booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_hotel_preferences_hotel_id 
ON booking_hotel_preferences(hotel_id);

-- ============================================
-- VERIFICATION QUERIES (run these to check)
-- ============================================

-- Check bookings table structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'bookings' ORDER BY ordinal_position;

-- Check booking_hotel_preferences table structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'booking_hotel_preferences' ORDER BY ordinal_position;

-- View a booking with its hotel preferences in order
-- SELECT 
--     b.id as booking_id,
--     b.status,
--     b.start_date,
--     bhp.preference_number,
--     h.id as hotel_id,
--     h.hotel_name
-- FROM bookings b
-- LEFT JOIN booking_hotel_preferences bhp ON b.id = bhp.booking_id
-- LEFT JOIN hotels h ON bhp.hotel_id = h.id
-- WHERE b.id = 1
-- ORDER BY bhp.preference_number ASC;
