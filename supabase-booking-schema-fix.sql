-- ============================================
-- FIX: booking_hotel_preferences Table Schema
-- ============================================

-- Step 1: Drop the old table if it exists (data will be lost)
DROP TABLE IF EXISTS booking_hotel_preferences CASCADE;

-- Step 2: Recreate with correct schema
CREATE TABLE booking_hotel_preferences (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    preference_number INTEGER NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_hotel FOREIGN KEY (hotel_id) 
        REFERENCES hotels(id) ON DELETE RESTRICT,
    
    -- Ensure each booking has unique preference numbers (1st, 2nd, 3rd choice)
    CONSTRAINT uk_booking_preference UNIQUE (booking_id, preference_number)
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_booking_hotel_preferences_booking_id 
ON booking_hotel_preferences(booking_id);

CREATE INDEX idx_booking_hotel_preferences_hotel_id 
ON booking_hotel_preferences(hotel_id);

-- Step 4: Verify table created successfully
-- SELECT * FROM booking_hotel_preferences LIMIT 0;
