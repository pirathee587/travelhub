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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.travelhub.backend.dto.response.ImageUploadResponse;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ImageUploadService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String roomBucket;         // maps to "room-images"

    @Value("${supabase.hotel-bucket}")
    private String hotelBucket;

    @Value("${supabase.review-bucket}")
    private String reviewBucket;       //  maps to "review-images"

    @Value("${supabase.user-bucket}")
    private String userBucket;

    @Value("${supabase.agent-bucket}")
    private String agentBucket;

    @Value("${supabase.package-bucket}")
    private String packageBucket;

    @Autowired
    private RestTemplate restTemplate;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "application/octet-stream"
    );

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            ".jpg", ".jpeg", ".png", ".webp"
    );

    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024L;

    // Old method — keeps working for agent image uploads
    public ImageUploadResponse uploadRoomImage(MultipartFile file) {
        return uploadToBucket(file, roomBucket);   //  pointing to reviewBucket
    }

    public ImageUploadResponse uploadHotelImage(MultipartFile file) {
        return uploadToBucket(file, hotelBucket);
    }

    public ImageUploadResponse uploadProfileImage(MultipartFile file) {
        return uploadToBucket(file, userBucket);
    }

                                                            //Dedicated method for review image uploads
    public ImageUploadResponse uploadReviewImage(MultipartFile file) {
        return uploadToBucket(file, reviewBucket);
    }

    public ImageUploadResponse uploadPackageImage(MultipartFile file) {
        try {
            return uploadToBucket(file, packageBucket);
        } catch (Exception e) {
            log.warn("[ImageUpload] Package bucket '{}' failed ({}), trying fallback to userBucket '{}'", packageBucket, e.getMessage(), userBucket);
            try {
                return uploadToBucket(file, userBucket);
            } catch (Exception ex) {
                log.warn("[ImageUpload] Bucket '{}' failed ({}), trying fallback to roomBucket '{}'", userBucket, ex.getMessage(), roomBucket);
                return uploadToBucket(file, roomBucket);
            }
        }
    }

    public ImageUploadResponse uploadAgentImage(MultipartFile file) {
        try {
            return uploadToBucket(file, agentBucket);
        } catch (Exception e) {
            log.warn("[ImageUpload] Bucket '{}' failed ({}), trying fallback to userBucket '{}'", agentBucket, e.getMessage(), userBucket);
            try {
                return uploadToBucket(file, userBucket);
            } catch (Exception ex) {
                log.warn("[ImageUpload] Bucket '{}' failed ({}), trying fallback to roomBucket '{}'", userBucket, ex.getMessage(), roomBucket);
                return uploadToBucket(file, roomBucket);
            }
        }
    }

    private ImageUploadResponse uploadToBucket(MultipartFile file, String bucketName) {

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

        // ── Step 3 & 4: Upload to Supabase ───────────────────────────────────
        try {
            String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, uniqueFileName);

            log.info("[ImageUpload] Uploading to bucket '{}': {}", bucketName, uploadUrl);

            HttpHeaders headers = new HttpHeaders();
            
            headers.set("apikey", supabaseKey);                     //Supabase Connection
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.setContentType(MediaType.valueOf(
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream"
            ));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("[ImageUpload] Supabase returned non-2xx: {} - {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to upload to Supabase: " + response.getBody());
            }

            log.info("[ImageUpload] Upload successful for file: {}", uniqueFileName);

        } catch (HttpClientErrorException ex) {                                                     //Error Handling
            log.error("[ImageUpload] Supabase HTTP error: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("Supabase Upload Error: " + ex.getStatusCode() + " - " + ex.getResponseBodyAsString());
        } catch (IOException ex) {
            log.error("[ImageUpload] Failed to read file: {}", ex.getMessage());
            throw new RuntimeException("Failed to read image file: " + ex.getMessage());
        } catch (Exception ex) {
            log.error("[ImageUpload] ❌ Unexpected error: {}", ex.getMessage(), ex);
            throw new RuntimeException("Supabase Upload Error: " + ex.getMessage());
        }

        // ── Step 5: Build and return response ────────────────────────────────
        String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, uniqueFileName);

        log.info("[ImageUpload] Public URL: {}", publicUrl);

        return ImageUploadResponse.builder()
                .imageUrl(publicUrl)
                .fileName(uniqueFileName)
                .build();
    }
}