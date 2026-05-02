-- ✅ SQL script to create review_images table
-- Run this in your database if using direct SQL execution

CREATE TABLE IF NOT EXISTS review_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    image_url LONGTEXT NOT NULL,
    CONSTRAINT fk_review_images_review 
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for faster queries
CREATE INDEX idx_review_images_review_id ON review_images(review_id);
