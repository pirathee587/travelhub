package com.travelhub.backend.dto.response;

import java.util.List;

public class HotelResponse {
    private Long id;
    private String hotelName;
    private String destination;
    private String location;
    private String description;
    private Double priceFrom;
    private Double priceTo;
    private Double rating;
    private Integer reviewCount;
    private String imageUrl;
    private List<String> amenities;
    private String district;
    private String applicationStatus;
    private String hotelEmail;
    private String hotelContactNumber;

    public HotelResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPriceFrom() { return priceFrom; }
    public void setPriceFrom(Double priceFrom) { this.priceFrom = priceFrom; }
    public Double getPriceTo() { return priceTo; }
    public void setPriceTo(Double priceTo) { this.priceTo = priceTo; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; }
    public String getHotelEmail() { return hotelEmail; }
    public void setHotelEmail(String hotelEmail) { this.hotelEmail = hotelEmail; }
    public String getHotelContactNumber() { return hotelContactNumber; }
    public void setHotelContactNumber(String hotelContactNumber) { this.hotelContactNumber = hotelContactNumber; }

    public static class Builder {
        private Long id;
        private String hotelName;
        private String destination;
        private String location;
        private String description;
        private Double priceFrom;
        private Double priceTo;
        private Double rating;
        private Integer reviewCount;
        private String imageUrl;
        private List<String> amenities;
        private String district;
        private String applicationStatus;
        private String hotelEmail;
        private String hotelContactNumber;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder hotelName(String hotelName) { this.hotelName = hotelName; return this; }
        public Builder destination(String destination) { this.destination = destination; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder priceFrom(Double priceFrom) { this.priceFrom = priceFrom; return this; }
        public Builder priceTo(Double priceTo) { this.priceTo = priceTo; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder reviewCount(Integer reviewCount) { this.reviewCount = reviewCount; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder amenities(List<String> amenities) { this.amenities = amenities; return this; }
        public Builder district(String district) { this.district = district; return this; }
        public Builder applicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; return this; }
        public Builder hotelEmail(String hotelEmail) { this.hotelEmail = hotelEmail; return this; }
        public Builder hotelContactNumber(String hotelContactNumber) { this.hotelContactNumber = hotelContactNumber; return this; }

        public HotelResponse build() {
            HotelResponse r = new HotelResponse();
            r.setId(id);
            r.setHotelName(hotelName);
            r.setDestination(destination);
            r.setLocation(location);
            r.setDescription(description);
            r.setPriceFrom(priceFrom);
            r.setPriceTo(priceTo);
            r.setRating(rating);
            r.setReviewCount(reviewCount);
            r.setImageUrl(imageUrl);
            r.setAmenities(amenities);
            r.setDistrict(district);
            r.setApplicationStatus(applicationStatus);
            r.setHotelEmail(hotelEmail);
            r.setHotelContactNumber(hotelContactNumber);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}