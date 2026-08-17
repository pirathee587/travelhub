-- V31: Create admin_notification_states table
-- Replaces in-memory ConcurrentHashMap with persistent DB storage
-- so that read/deleted notification state survives server restarts

CREATE TABLE IF NOT EXISTS admin_notification_states (
    id           BIGSERIAL PRIMARY KEY,
    admin_id     BIGINT NOT NULL,
    notif_id     BIGINT NOT NULL,
    state        VARCHAR(10) NOT NULL, -- 'READ' or 'DELETED'
    created_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_notif_states_user FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_admin_notif_state UNIQUE (admin_id, notif_id, state)
);

CREATE INDEX IF NOT EXISTS idx_admin_notif_states_admin ON admin_notification_states(admin_id);
