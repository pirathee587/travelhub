-- V28: Create package reports and evidence tables for Tourist-Admin dispute system

CREATE TABLE IF NOT EXISTS package_reports (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id BIGINT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    admin_notes TEXT,
    resolution TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS package_report_evidence (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES package_reports(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_package_reports_user_id ON package_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_package_reports_booking_id ON package_reports(booking_id);
CREATE INDEX IF NOT EXISTS idx_package_reports_agent_id ON package_reports(agent_id);
CREATE INDEX IF NOT EXISTS idx_package_reports_status ON package_reports(status);
