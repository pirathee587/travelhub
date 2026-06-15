package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.util.List;

/**
 * Package entity represents a travel package offered by an agent.
 * It contains details about the destination, pricing, itinerary, and images.
 */
@Entity
@Table(name = "packages")
public class Package {

    /**
     * Default constructor for JPA.
     */
    public Package() {}
    
    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public Double getPriceFrom() { return priceFrom; }
    public void setPriceFrom(Double priceFrom) { this.priceFrom = priceFrom; }
    public Double getPriceTo() { return priceTo; }
    public void setPriceTo(Double priceTo) { this.priceTo = priceTo; }
    public String getStartPlace() { return startPlace; }
    public void setStartPlace(String startPlace) { this.startPlace = startPlace; }
    public String getEndPlace() { return endPlace; }
    public void setEndPlace(String endPlace) { this.endPlace = endPlace; }
    public List<PackageImage> getImages() { return images; }
    public void setImages(List<PackageImage> images) { this.images = images; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    public String getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; }
    public String getFestivalDetails() { return festivalDetails; }
    public void setFestivalDetails(String festivalDetails) { this.festivalDetails = festivalDetails; }
    public String getInclusions() { return inclusions; }
    public void setInclusions(String inclusions) { this.inclusions = inclusions; }
    public List<PackageItinerary> getItinerary() { return itinerary; }
    public void setItinerary(List<PackageItinerary> itinerary) { this.itinerary = itinerary; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Boolean getTrending() { return trending; }
    public void setTrending(Boolean trending) { this.trending = trending; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // Unique identifier for the travel package
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The agent who created and manages this package
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    // The display name of the travel package
    @Column(nullable = false)
    private String packageName;

    // The primary destination of the package
    @Column(nullable = false)
    private String destination;

    // Starting location of the trip
    private String startPlace;
    
    // Ending location of the trip
    private String endPlace;
    
    // Minimum price for the package
    private Double priceFrom;
    
    // Maximum price for the package
    private Double priceTo;
    
    // Total duration of the trip (e.g., "3 Days, 2 Nights")
    private String duration;
    
    // Category of the package (e.g., Adventure, Cultural, Beach)
    private String category;
    
    // URL or path to the main featured image for the package
    private String imageUrl;
    
    // Average user rating based on reviews
    private Double rating;
    
    // Total number of reviews received
    private Integer reviewCount;

    // Extra details about festivals or special events included in the package
    @Column(columnDefinition = "TEXT")
    private String festivalDetails;

    // Flag indicating if the package is currently trending/promoted
    private Boolean trending = false;
    
    // Flag to enable or disable the package for tourists
    private Boolean isActive = true;
    
    // The administrative district associated with the package
    private String district;

    // List of what is included in the package (e.g., meals, entrance fees)
    @Column(columnDefinition = "TEXT")
    private String inclusions;

    // Admin approval status for the package application (e.g., Pending, Approved)
    @Column(name = "application_status")
    private String applicationStatus = "Pending";

    // Detailed day-by-day itinerary for the trip
    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    private List<PackageItinerary> itinerary;

    // Additional gallery images for the package
    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackageImage> images;
}