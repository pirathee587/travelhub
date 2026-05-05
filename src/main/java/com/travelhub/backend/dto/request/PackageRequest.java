package com.travelhub.backend.dto.request;

import java.util.List;

public class PackageRequest {
    private String packageName;
    private String destination;
    private String startPlace;
    private String endPlace;
    private Double priceFrom;
    private Double priceTo;
    private String duration;
    private String category;
    private String imageUrl;
    private String festivalDetails;
    private Boolean trending;
    private String district;
    private List<ItineraryDayRequest> itinerary;
    private List<String> images;

    public PackageRequest() {}

    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
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
    public String getFestivalDetails() { return festivalDetails; }
    public void setFestivalDetails(String festivalDetails) { this.festivalDetails = festivalDetails; }
    public Boolean getTrending() { return trending; }
    public void setTrending(Boolean trending) { this.trending = trending; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public List<ItineraryDayRequest> getItinerary() { return itinerary; }
    public void setItinerary(List<ItineraryDayRequest> itinerary) { this.itinerary = itinerary; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public static class ItineraryDayRequest {
        private Integer dayNumber;
        private String title;
        private String description;
        private List<String> activities;

        public ItineraryDayRequest() {}

        public Integer getDayNumber() { return dayNumber; }
        public void setDayNumber(Integer dayNumber) { this.dayNumber = dayNumber; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getActivities() { return activities; }
        public void setActivities(List<String> activities) { this.activities = activities; }
    }
}
