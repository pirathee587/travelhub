-- V32: Repair notification tables
-- The Flyway history shows V29 and V31 as applied but the tables were never created.
-- Remove the stale history entries so they can be re-applied, then create tables.

-- Step 1: Remove stale entries from Flyway history (idempotent)
DELETE FROM flyway_schema_history
WHERE version IN ('29', '31') AND success = false;

-- Step 2: Create admin_notification_preferences if it doesn't exist yet
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
    CONSTRAINT fk_admin_notification_preferences_user
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 3: Create admin_notification_states if it doesn't exist yet
CREATE TABLE IF NOT EXISTS admin_notification_states (
    id           BIGSERIAL PRIMARY KEY,
    admin_id     BIGINT NOT NULL,
    notif_id     BIGINT NOT NULL,
    state        VARCHAR(10) NOT NULL,
    created_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_notif_states_user
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_admin_notif_state
        UNIQUE (admin_id, notif_id, state)
);

CREATE INDEX IF NOT EXISTS idx_admin_notif_states_admin
    ON admin_notification_states(admin_id);
