package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ImageUploadResponse — returned after a successful image upload.
 *
 * imageUrl  → the full public URL to access the image
 *             e.g. http://localhost:8080/uploads/room-images/abc123.jpg
 * fileName  → the unique saved file name (UUID-based)
 *             e.g. 3f4a2b1c-9e87-4a12-b345-abc123456789.jpg
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadResponse {
    private String imageUrl;
    private String fileName;
}
