-- V23: Add nic_verification_status and admin_message columns to users table
-- Supports Agency NIC hybrid verification model and Admin rejection/suspension feedback messages

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS nic_verification_status VARCHAR(20) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS admin_message TEXT;
