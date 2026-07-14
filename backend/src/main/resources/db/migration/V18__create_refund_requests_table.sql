CREATE TABLE refund_requests (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    agent_id BIGINT NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_no VARCHAR(255) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    reason VARCHAR(1000),
    refund_slip_url VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refund_requests_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    CONSTRAINT fk_refund_requests_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_refund_requests_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);
