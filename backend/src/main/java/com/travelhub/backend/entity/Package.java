package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "packages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Human-readable package ID e.g. PKG001
    @Column(name = "package_id", unique = true, length = 20)
    private String packageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Agent agent;

    // ── Core fields ───────────────────────────────────────────
    @Column(nullable = false)
    private String packageName;

    private String startPlace;
    private String endPlace;
    private String duration;
    private String category;
    private String district;

    public String getDestination() {
        return this.endPlace;
    }

    // ── Package Type ──────────────────────────────────────────
    @Column(name = "package_type")
    @Builder.Default
    private String packageType = "SINGLE_DISTRICT"; // SINGLE_DISTRICT or MULTI_DISTRICT

    // ── Price ─────────────────────────────────────────────────
    @Column(name = "price_from")
    private Double priceFrom;

    @Column(name = "price_to")
    private Double priceTo;

    // ── Per-person pricing ────────────────────────────────────
    @Column(name = "base_price_adult")
    private Double basePriceAdult;

    @Column(name = "base_price_child")
    private Double basePriceChild;

    // ── Content fields ─────────────────────────────────────────
    @Column(length = 2000)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String festivalDetails;

    @Column(columnDefinition = "TEXT")
    private String inclusions;

    // ── Status fields ──────────────────────────────────────────
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "application_status")
    @Builder.Default
    private String applicationStatus = "Pending";

    @Builder.Default
    private Boolean trending = false;

    // ── Stats (set by review system) ───────────────────────────
    private Double rating;
    private Integer reviewCount;

    // ── Legacy single image URL ────────────────────────────────
    private String imageUrl;

    // ── Soft delete ────────────────────────────────────────────
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "package_type")
    private String packageType;

    // ── Timestamps ─────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Relationships ──────────────────────────────────────────
    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    private List<PackageItinerary> itinerary = new ArrayList<>();

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<PackageImage> images = new ArrayList<>();

    // ── Category Enum ──────────────────────────────────────────
    public enum PackageCategory {
        CULTURE, BEACH, MOUNTAIN, CITY, WILDLIFE
    }
}