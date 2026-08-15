-- Flyway migration to add payment_status, cancellation policy, and fine columns

-- 1. Add payment_status to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID';
UPDATE bookings SET payment_status = 'UNPAID' WHERE payment_status IS NULL;

-- 2. Add outstanding_fine_balance to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS outstanding_fine_balance DOUBLE PRECISION DEFAULT 0.0;
UPDATE users SET outstanding_fine_balance = 0.0 WHERE outstanding_fine_balance IS NULL;

-- 3. Add cancellation_fee and net_refund_amount to refund_requests table
ALTER TABLE refund_requests ADD COLUMN IF NOT EXISTS cancellation_fee DOUBLE PRECISION;
ALTER TABLE refund_requests ADD COLUMN IF NOT EXISTS net_refund_amount DOUBLE PRECISION;

-- 4. Add free_cancellation_days and cancellation_fee_percent to agent_settings table
ALTER TABLE agent_settings ADD COLUMN IF NOT EXISTS free_cancellation_days INT DEFAULT 2;
ALTER TABLE agent_settings ADD COLUMN IF NOT EXISTS cancellation_fee_percent DOUBLE PRECISION DEFAULT 10.0;
