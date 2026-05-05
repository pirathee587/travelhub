package com.travelhub.backend.dto.response;

import java.util.List;

public class PackageDetailResponse {
    private Long id;
    private String packageName;
    private String destination;
    private String district;
    private String startPlace;
    private String endPlace;
    private Double priceFrom;
    private Double priceTo;
    private String duration;
    private String category;
    private String imageUrl;
    private Double rating;
    private Integer reviewCount;
    private String festivalDetails;
    private Boolean trending;
    private Long agentId;
    private String agentName;
    private String agentPhone;
    private Double agentRating;
    private List<ItineraryDayResponse> itinerary;
    private List<String> images;

    public PackageDetailResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getStartPlace() { return startPlace; }
    public void setStartPlace(String startPlace) { this.startPlace = startPlace; }
    public String getEndPlace() { return endPlace; }
    public void setEndPlace(String endPlace) { this.endPlace = endPlace; }
    public Double getPriceFrom() { return priceFrom; }
    public void setPriceFrom(Double priceFrom) { this.priceFrom = priceFrom; }
    public Double getPriceTo() { return priceTo; }
    public void setPriceTo(Double priceTo) { this.priceTo = priceTo; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getFestivalDetails() { return festivalDetails; }
    public void setFestivalDetails(String festivalDetails) { this.festivalDetails = festivalDetails; }
    public Boolean getTrending() { return trending; }
    public void setTrending(Boolean trending) { this.trending = trending; }
    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public String getAgentPhone() { return agentPhone; }
    public void setAgentPhone(String agentPhone) { this.agentPhone = agentPhone; }
    public Double getAgentRating() { return agentRating; }
    public void setAgentRating(Double agentRating) { this.agentRating = agentRating; }
    public List<ItineraryDayResponse> getItinerary() { return itinerary; }
    public void setItinerary(List<ItineraryDayResponse> itinerary) { this.itinerary = itinerary; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public static class ItineraryDayResponse {
        private Integer dayNumber;
        private String title;
        private String description;
        private List<String> activities;

        public ItineraryDayResponse() {}

        public Integer getDayNumber() { return dayNumber; }
        public void setDayNumber(Integer dayNumber) { this.dayNumber = dayNumber; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getActivities() { return activities; }
        public void setActivities(List<String> activities) { this.activities = activities; }
    }

    public static class Builder {
        private Long id;
        private String packageName;
        private String destination;
        private String district;
        private String startPlace;
        private String endPlace;
        private Double priceFrom;
        private Double priceTo;
        private String duration;
        private String category;
        private String imageUrl;
        private Double rating;
        private Integer reviewCount;
        private String festivalDetails;
        private Boolean trending;
        private Long agentId;
        private String agentName;
        private String agentPhone;
        private Double agentRating;
        private List<ItineraryDayResponse> itinerary;
        private List<String> images;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder packageName(String packageName) { this.packageName = packageName; return this; }
        public Builder destination(String destination) { this.destination = destination; return this; }
        public Builder district(String district) { this.district = district; return this; }
        public Builder startPlace(String startPlace) { this.startPlace = startPlace; return this; }
        public Builder endPlace(String endPlace) { this.endPlace = endPlace; return this; }
        public Builder priceFrom(Double priceFrom) { this.priceFrom = priceFrom; return this; }
        public Builder priceTo(Double priceTo) { this.priceTo = priceTo; return this; }
        public Builder duration(String duration) { this.duration = duration; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder reviewCount(Integer reviewCount) { this.reviewCount = reviewCount; return this; }
        public Builder festivalDetails(String festivalDetails) { this.festivalDetails = festivalDetails; return this; }
        public Builder trending(Boolean trending) { this.trending = trending; return this; }
        public Builder agentId(Long agentId) { this.agentId = agentId; return this; }
        public Builder agentName(String agentName) { this.agentName = agentName; return this; }
        public Builder agentPhone(String agentPhone) { this.agentPhone = agentPhone; return this; }
        public Builder agentRating(Double agentRating) { this.agentRating = agentRating; return this; }
        public Builder itinerary(List<ItineraryDayResponse> itinerary) { this.itinerary = itinerary; return this; }
        public Builder images(List<String> images) { this.images = images; return this; }

        public PackageDetailResponse build() {
            PackageDetailResponse r = new PackageDetailResponse();
            r.setId(id);
            r.setPackageName(packageName);
            r.setDestination(destination);
            r.setDistrict(district);
            r.setStartPlace(startPlace);
            r.setEndPlace(endPlace);
            r.setPriceFrom(priceFrom);
            r.setPriceTo(priceTo);
            r.setDuration(duration);
            r.setCategory(category);
            r.setImageUrl(imageUrl);
            r.setRating(rating);
            r.setReviewCount(reviewCount);
            r.setFestivalDetails(festivalDetails);
            r.setTrending(trending);
            r.setAgentId(agentId);
            r.setAgentName(agentName);
            r.setAgentPhone(agentPhone);
            r.setAgentRating(agentRating);
            r.setItinerary(itinerary);
            r.setImages(images);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}