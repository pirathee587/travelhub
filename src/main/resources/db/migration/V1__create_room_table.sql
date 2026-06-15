-- Create Room table
CREATE TABLE IF NOT EXISTS room (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    availability BOOLEAN NOT NULL DEFAULT TRUE,
    hotel_id BIGINT NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create index for hotel_id
CREATE INDEX IF NOT EXISTS idx_room_hotel_id ON room(hotel_id);
