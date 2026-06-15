package com.travelhub.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.travelhub.backend.dto.response.ImageUploadResponse;

/**
 * ImageUploadService handles the uploading of image files to Supabase Storage.
 * It provides categorized upload methods for rooms, hotels, user profiles, and reviews.
 */
@Service
public class ImageUploadService {

    private static final Logger log = LoggerFactory.getLogger(ImageUploadService.class);

    // Supabase configuration loaded from application properties
    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String roomBucket;

    @Value("${supabase.hotel-bucket}")
    private String hotelBucket;

    @Value("${supabase.review-bucket}")
    private String reviewBucket;

    @Value("${supabase.user-bucket}")
    private String userBucket;

    private final RestTemplate restTemplate;

    /**
     * Constructor injection for RestTemplate to handle HTTP requests.
     */
    public ImageUploadService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // List of permitted MIME types for uploads
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "application/octet-stream"
    );

    // List of permitted file extensions
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            ".jpg", ".jpeg", ".png", ".webp"
    );

    // Maximum permitted file size (5MB)
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024L;

    /**
     * Uploads an image specifically to the 'room' bucket.
     */
    public ImageUploadResponse uploadRoomImage(MultipartFile file) {
        return uploadToBucket(file, roomBucket);
    }

    /**
     * Uploads an image specifically to the 'hotel' bucket.
     */
    public ImageUploadResponse uploadHotelImage(MultipartFile file) {
        return uploadToBucket(file, hotelBucket);
    }

    /**
     * Uploads an image specifically to the 'user' bucket for profile pictures.
     */
    public ImageUploadResponse uploadProfileImage(MultipartFile file) {
        return uploadToBucket(file, userBucket);
    }

    /**
     * Uploads an image specifically to the 'review' bucket for user feedback.
     */
    public ImageUploadResponse uploadReviewImage(MultipartFile file) {
        return uploadToBucket(file, reviewBucket);
    }

    /**
     * Generic internal method to handle the actual upload logic to a specified Supabase bucket.
     * Performs validation on file existence, type, extension, and size.
     */
    private ImageUploadResponse uploadToBucket(MultipartFile file, String bucketName) {
        // Validation: Ensure a file was actually selected
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file selected. Please choose an image.");
        }

        // Extract file extension and validate
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

        // Validation: Ensure file size is within limits
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("File size exceeds the 5MB limit.");
        }

        // Generate a unique filename using UUID to prevent collisions
        String uniqueFileName = UUID.randomUUID().toString() + extension;

        try {
            // Construct the Supabase Storage API URL
            String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, uniqueFileName);

            log.info("[ImageUpload] Uploading to bucket '{}': {}", bucketName, uploadUrl);

            // Set required headers for Supabase authentication and content type
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseKey);
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.setContentType(MediaType.valueOf(
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream"
            ));

            // Prepare the request entity with file bytes
            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            // Execute the POST request to upload the file
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("[ImageUpload] Supabase returned non-2xx: {} - {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to upload to Supabase: " + response.getBody());
            }

            log.info("[ImageUpload] ✅ Upload successful for file: {}", uniqueFileName);

        } catch (HttpClientErrorException ex) {
            log.error("[ImageUpload] ❌ Supabase HTTP error: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("Supabase Upload Error: " + ex.getStatusCode() + " - " + ex.getResponseBodyAsString());
        } catch (IOException ex) {
            log.error("[ImageUpload] ❌ Failed to read file: {}", ex.getMessage());
            throw new RuntimeException("Failed to read image file: " + ex.getMessage());
        } catch (Exception ex) {
            log.error("[ImageUpload] ❌ Unexpected error: {}", ex.getMessage(), ex);
            throw new RuntimeException("Supabase Upload Error: " + ex.getMessage());
        }

        // Construct the public access URL for the uploaded image
        String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, uniqueFileName);

        log.info("[ImageUpload] Public URL: {}", publicUrl);

        // Build and return the response DTO
        ImageUploadResponse uploadResponse = new ImageUploadResponse();
        uploadResponse.setImageUrl(publicUrl);
        uploadResponse.setFileName(uniqueFileName);
        return uploadResponse;
    }
}
