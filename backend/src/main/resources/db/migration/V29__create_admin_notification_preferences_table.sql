-- V29: Create admin notification preferences table
CREATE TABLE IF NOT EXISTS admin_notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL UNIQUE,
    notify_agent_registrations BOOLEAN NOT NULL DEFAULT TRUE,
    notify_hotel_registrations BOOLEAN NOT NULL DEFAULT TRUE,
    notify_package_approvals BOOLEAN NOT NULL DEFAULT TRUE,
    notify_payment_received BOOLEAN NOT NULL DEFAULT TRUE,
    notify_tourist_reports BOOLEAN NOT NULL DEFAULT TRUE,
    notify_system_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_notification_preferences_user FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
