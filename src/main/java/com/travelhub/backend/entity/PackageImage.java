package com.travelhub.backend.entity;

import jakarta.persistence.*;

/**
 * PackageImage entity represents an image in the gallery of a travel package.
 * It stores the image storage location and the order in which it should be displayed.
 */
@Entity
@Table(name = "package_images")
public class PackageImage {

    /**
     * Default constructor for JPA.
     */
    public PackageImage() {}
    
    // --- Getters and Setters ---
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    // Unique identifier for the package image record
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship: The specific travel package that this image belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package pkg;

    // URL or physical storage path of the image file
    @Column(nullable = false)
    private String imageUrl;

    // Sequence number to determine the display position in a gallery
    private Integer displayOrder;
}