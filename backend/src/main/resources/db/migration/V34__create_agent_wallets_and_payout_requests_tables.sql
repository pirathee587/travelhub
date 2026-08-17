-- Migration V34: Create agent_wallets, wallet_transactions, and payout_requests tables

CREATE TABLE IF NOT EXISTS agent_wallets (
    id BIGSERIAL PRIMARY KEY,
    agent_id BIGINT NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
    available_balance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    pending_escrow_balance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_withdrawn DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    description TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payout_requests (
    id BIGSERIAL PRIMARY KEY,
    agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_no VARCHAR(255) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    transfer_slip_url VARCHAR(500),
    processed_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_agent ON wallet_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_agent ON payout_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
