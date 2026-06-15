package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Document entity represents a file uploaded by a user.
 * It can be a personal document or one specifically linked to a booking (e.g., passport copy, ticket).
 */
@Entity
@Table(name = "documents")
public class Document {
    
    // Unique identifier for the document record
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who owns this document
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Optional relationship to a specific booking this document belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // Display name or title of the document
    @Column(nullable = false)
    private String title;

    // The category or type of the document (e.g., PDF, Image, ID_CARD, TICKET)
    @Column(nullable = false)
    private String docType;

    // URL or physical path where the file is stored
    private String filePath;
    
    // Human-readable size of the file (e.g., "1.2 MB")
    private String fileSize;

    // Timestamp of when the document was uploaded
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * Life-cycle hook to set the creation timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Default constructor for JPA.
     */
    public Document() {}

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    /**
     * Inner Builder class for the fluent creation of Document objects.
     */
    public static class Builder {
        private Long id;
        private User user;
        private Booking booking;
        private String title;
        private String docType;
        private String filePath;
        private String fileSize;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder booking(Booking booking) { this.booking = booking; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder docType(String docType) { this.docType = docType; return this; }
        public Builder filePath(String filePath) { this.filePath = filePath; return this; }
        public Builder fileSize(String fileSize) { this.fileSize = fileSize; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        /**
         * Builds and returns a Document object based on the builder's configuration.
         */
        public Document build() {
            Document d = new Document();
            d.setId(id);
            d.setUser(user);
            d.setBooking(booking);
            d.setTitle(title);
            d.setDocType(docType);
            d.setFilePath(filePath);
            d.setFileSize(fileSize);
            d.setCreatedAt(createdAt);
            return d;
        }
    }

    /**
     * Returns a new Builder instance for Document.
     */
    public static Builder builder() { return new Builder(); }
}
