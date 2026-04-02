package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.response.ImageUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * ImageUploadService — core business logic for Feature A (Image Upload Utility).
 *
 * Flow:
 *   1. Validate: not empty, correct type, within size limit
 *   2. Generate a unique UUID-based filename
 *   3. Create the uploads/room-images/ directory if it doesn't exist
 *   4. Save the file to disk using Files.copy (reliable)
 *   5. Return ImageUploadResponse with the public URL
 */
@Service
public class ImageUploadService {

    // Reads from application.properties — defaults to "uploads" if not set
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // Reads from application.properties — defaults to localhost:8080 if not set
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

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
            throw new BadRequestException("No file selected. Please choose an image.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        boolean isValidType = ALLOWED_TYPES.contains(file.getContentType());
        boolean isValidExtension = ALLOWED_EXTENSIONS.contains(extension);

        if (!isValidType && !isValidExtension) {
            throw new BadRequestException(
                    "Invalid file type '" + file.getContentType() +
                    "'. Only JPG, PNG, and WEBP images are allowed."
            );
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds the 5MB limit.");
        }

        // ── Step 2: Generate unique filename ─────────────────────────────────

        String uniqueFileName = UUID.randomUUID().toString() + extension;

        // ── Step 3 & 4: Create directory and save file ───────────────────────

        try {
            // toAbsolutePath() ensures it works regardless of working directory
            Path uploadPath = Paths.get(uploadDir, "room-images").toAbsolutePath();
            Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(uniqueFileName);

            // Files.copy with InputStream is the most reliable way in Spring Boot
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        } catch (IOException ex) {
            throw new RuntimeException(
                    "Failed to save the image file. Details: " + ex.getMessage()
            );
        }

        // ── Step 5: Build and return response ────────────────────────────────

        String imageUrl = baseUrl + "/uploads/room-images/" + uniqueFileName;

        return ImageUploadResponse.builder()
                .imageUrl(imageUrl)
                .fileName(uniqueFileName)
                .build();
    }
}
