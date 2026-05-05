package com.travelhub.backend.dto.response;

public class ImageUploadResponse {
    private String imageUrl;
    private String fileName;

    public ImageUploadResponse() {}

    public ImageUploadResponse(String imageUrl, String fileName) {
        this.imageUrl = imageUrl;
        this.fileName = fileName;
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    // Helper for easier instantiation similar to builder
    public static class Builder {
        private String imageUrl;
        private String fileName;

        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder fileName(String fileName) { this.fileName = fileName; return this; }
        public ImageUploadResponse build() {
            return new ImageUploadResponse(imageUrl, fileName);
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
