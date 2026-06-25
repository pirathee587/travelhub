-- V10: Migrate image_url from hotels table into hotel_images table
-- For every hotel that has an image_url AND no existing hotel_images row,
-- insert a new record so no image data is lost.

INSERT INTO hotel_images (hotel_id, image_url, display_order, original_file_name)
SELECT
    h.id,
    h.image_url,
    0,
    'migrated_from_image_url'
FROM hotels h
WHERE h.image_url IS NOT NULL
  AND h.image_url <> ''
  AND NOT EXISTS (
      SELECT 1 FROM hotel_images hi WHERE hi.hotel_id = h.id
  );
