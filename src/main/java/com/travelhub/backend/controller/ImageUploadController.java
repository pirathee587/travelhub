package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.response.ImageUploadResponse;
import com.travelhub.backend.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * ImageUploadController — REST endpoint for Feature A (Image Upload Utility).
 *
 * Endpoint : POST /api/upload/image
 * Body     : multipart/form-data  →  key: "file"
 * Returns  : ApiResponse { success, message, data: { imageUrl, fileName } }
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImageUploadController {

    private final ImageUploadService imageUploadService;

    /**
     * POST /api/upload/image
     *
     * Accepts an image file, saves it to the server, and returns
     * a public URL that can be stored in the Room's imageUrl column.
     *
     * @param file  the image file (multipart/form-data, key = "file")
     * @return      200 OK with imageUrl and fileName on success
     */
    @PostMapping("/image")
    public ResponseEntity<ApiResponse> uploadImage(
            @RequestParam("file") MultipartFile file) {

        ImageUploadResponse uploadResponse = imageUploadService.uploadRoomImage(file);          

        return ResponseEntity.ok(
                new ApiResponse(true, "Image uploaded successfully", uploadResponse)
        );
    }
}
