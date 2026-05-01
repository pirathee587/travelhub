package com.travelhub.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.travelhub.backend.dto.response.ImageUploadResponse;

@Service
public class ImageUploadService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.review-bucket}")
    private String supabaseBucket;

    @Autowired
    private RestTemplate restTemplate;

    // Only these image formats are accepted
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "application/octet-stream"
    );

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            ".jpg", ".jpeg", ".png", ".webp"
    );

    // Maximum allowed file size: 5 MB
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024L;

    /**
     * Accepts a MultipartFile, validates it, saves it, and returns the public URL.
     *
     * @param file the image file sent from the frontend (form-data key: "file")
     * @return ImageUploadResponse containing imageUrl and fileName
     */
    public ImageUploadResponse uploadRoomImage(MultipartFile file) {

        // ── Step 1: Validate ──────────────────────────────────────────────────

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file selected. Please choose an image.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        boolean isValidType = ALLOWED_TYPES.contains(file.getContentType());
        boolean isValidExtension = ALLOWED_EXTENSIONS.contains(extension);

        if (!isValidType && !isValidExtension) {
            throw new RuntimeException(
                    "Invalid file type '" + file.getContentType() +
                    "'. Only JPG, PNG, and WEBP images are allowed."
            );
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("File size exceeds the 5MB limit.");
        }

        // ── Step 2: Generate unique filename ─────────────────────────────────

        String uniqueFileName = UUID.randomUUID().toString() + extension;

        // ── Step 3 & 4: Upload to Supabase ──────────────────────────────────

        try {
            String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, supabaseBucket, uniqueFileName);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);
            headers.setContentType(MediaType.valueOf(file.getContentType()));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to upload to Supabase: " + response.getBody());
            }

        } catch (IOException ex) {
            throw new RuntimeException("Failed to read image file: " + ex.getMessage());
        } catch (Exception ex) {
            throw new RuntimeException("Supabase Upload Error: " + ex.getMessage());
        }

        // ── Step 5: Build and return response ────────────────────────────────

        String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, supabaseBucket, uniqueFileName);

        return ImageUploadResponse.builder()
                .imageUrl(publicUrl)
                .fileName(uniqueFileName)
                .build();
    }
}
