-- ============================================
-- VERIFY & FIX: bookings Table Schema
-- ============================================

-- Check if hotel_ids_with_preference column exists, if not add it
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS hotel_ids_with_preference TEXT;

-- List all columns in bookings table (for verification)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'bookings' 
-- ORDER BY ordinal_position;

-- List all columns in booking_hotel_preferences table (for verification)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'booking_hotel_preferences' 
-- ORDER BY ordinal_position;
