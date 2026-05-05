package com.travelhub.backend.dto.response;

import java.time.LocalDateTime;

public class DocumentResponse {
    private Long id;
    private String title;
    private String docType;
    private String fileSize;
    private String filePath;
    private LocalDateTime createdAt;
    private String bookingName;

    public DocumentResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }
    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getBookingName() { return bookingName; }
    public void setBookingName(String bookingName) { this.bookingName = bookingName; }

    public static class Builder {
        private Long id;
        private String title;
        private String docType;
        private String fileSize;
        private String filePath;
        private LocalDateTime createdAt;
        private String bookingName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder docType(String docType) { this.docType = docType; return this; }
        public Builder fileSize(String fileSize) { this.fileSize = fileSize; return this; }
        public Builder filePath(String filePath) { this.filePath = filePath; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder bookingName(String bookingName) { this.bookingName = bookingName; return this; }

        public DocumentResponse build() {
            DocumentResponse r = new DocumentResponse();
            r.setId(id);
            r.setTitle(title);
            r.setDocType(docType);
            r.setFileSize(fileSize);
            r.setFilePath(filePath);
            r.setCreatedAt(createdAt);
            r.setBookingName(bookingName);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}