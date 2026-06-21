-- User in-app notifications (tourists and all non-agent roles)
CREATE TABLE IF NOT EXISTS user_notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id),
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT,
    action_url  VARCHAR(500),
    read        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);

-- Email communication audit log
CREATE TABLE IF NOT EXISTS email_logs (
    id              BIGSERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    content         TEXT,
    status          VARCHAR(50)  NOT NULL,
    related_type    VARCHAR(100),
    related_id      BIGINT,
    error_message   TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- Update super admin password to admin123 (BCrypt)
UPDATE users
SET password = '$2b$10$KVsb550u3AR/mqAY7Y4fcOeLb/iuaMZ7Mg97E3bjXVoi8mYfmigPi'
WHERE email = 'saras69wathy+superadmin@gmail.com';
