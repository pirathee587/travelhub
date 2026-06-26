-- Hotel Owner notification table
CREATE TABLE IF NOT EXISTS owner_notifications (
    id            BIGSERIAL PRIMARY KEY,
    owner_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id      BIGINT,
    type          VARCHAR(50)  NOT NULL,   -- APPROVED | REJECTED | SUSPENDED
    title         VARCHAR(255) NOT NULL,
    message       TEXT,
    is_read       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
