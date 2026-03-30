package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    @Column(nullable = false)
    private String packageName;

    @Column(nullable = false)
    private String destination;

    private String startPlace;
    private String endPlace;
    private Double priceFrom;
    private Double priceTo;
    private String duration;
    private String category;
    private String imageUrl;
    private Double rating;
    private Integer reviewCount;

    @Column(columnDefinition = "TEXT")
    private String festivalDetails;

    private Boolean trending = false;
    private Boolean isActive = true;

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackageItinerary> itinerary;

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackageImage> images;
}