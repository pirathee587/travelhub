package com.travelhub.backend.dto.response;

public class PackageResponse {
    private Long id;
    private String packageName;
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
    private String festivalDetails;
    private Boolean trending;
    private String agentName;
    private String district;

    public PackageResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getFestivalDetails() { return festivalDetails; }
    public void setFestivalDetails(String festivalDetails) { this.festivalDetails = festivalDetails; }
    public Boolean getTrending() { return trending; }
    public void setTrending(Boolean trending) { this.trending = trending; }
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public static class Builder {
        private Long id;
        private String packageName;
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
        private String festivalDetails;
        private Boolean trending;
        private String agentName;
        private String district;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder packageName(String packageName) { this.packageName = packageName; return this; }
        public Builder destination(String destination) { this.destination = destination; return this; }
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
        public Builder agentName(String agentName) { this.agentName = agentName; return this; }
        public Builder district(String district) { this.district = district; return this; }

        public PackageResponse build() {
            PackageResponse r = new PackageResponse();
            r.setId(id);
            r.setPackageName(packageName);
            r.setDestination(destination);
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
            r.setAgentName(agentName);
            r.setDistrict(district);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}