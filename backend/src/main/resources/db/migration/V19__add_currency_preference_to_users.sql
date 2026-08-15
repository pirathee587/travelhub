-- V19: Add currency_preference column to users table
-- Supports Tourist currency preference (USD / LKR)
-- Defaults to 'USD' for all existing users so no data migration is needed

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS currency_preference VARCHAR(10) DEFAULT 'USD';
