-- V30__add_rejection_reason_to_packages.sql
ALTER TABLE packages ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
