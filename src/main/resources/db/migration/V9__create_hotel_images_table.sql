CREATE TABLE IF NOT EXISTS hotel_images (
    id SERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INTEGER,
    original_file_name VARCHAR(255),
    CONSTRAINT fk_hotel_images_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE
);
