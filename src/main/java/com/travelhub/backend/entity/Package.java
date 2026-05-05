package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "packages")




public class Package {
    public Package() {}
    
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
    private String district;

    @Column(columnDefinition = "TEXT")
    private String inclusions;

    @Column(name = "application_status")
    
    private String applicationStatus = "Pending";

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    private List<PackageItinerary> itinerary;

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackageImage> images;
}