package com.travelhub.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * ReviewImage entity represents an image file associated with a specific review.
 * It stores the storage location (URL) of the image and links back to the review record.
 */
@Entity
@Table(name = "review_images")
public class ReviewImage {

    // Unique identifier for the review image record
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship: The specific review that this image belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    // URL or physical storage path of the image file
    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    /**
     * Default constructor for JPA.
     */
    public ReviewImage() {}

    // --- Getters and Setters ---
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Review getReview() { return review; }
    public void setReview(Review review) { this.review = review; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
