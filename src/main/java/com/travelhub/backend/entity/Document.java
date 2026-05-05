package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String docType;

    private String filePath;
    private String fileSize;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Document() {}

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
    public static Builder builder() { return new Builder(); }
}
