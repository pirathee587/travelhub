-- ✅ SQL script to create review_images table (PostgreSQL / Supabase)
-- Run this in your Supabase SQL Editor if the table doesn't exist yet

CREATE TABLE IF NOT EXISTS review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    CONSTRAINT fk_review_images_review 
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);

-- ✅ Also ensure the reviews table has the user_name column
-- (needed because @Transient was removed and userName now persists)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title VARCHAR(255);
