package com.travelhub.backend.dto.request;






public class OwnerHotelRequest {
    private String hotelName;
    private String destination;
    private String location;
    private String description;
    private Double priceFrom;
    private Double priceTo;
    private String imageUrl;
    private String district;
    private String phoneNumber;
    private String hotlineNumber;
    private String ownerName;
    private String ownerEmail;
    private String ownerNic;

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
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getHotlineNumber() { return hotlineNumber; }
    public void setHotlineNumber(String hotlineNumber) { this.hotlineNumber = hotlineNumber; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public String getOwnerNic() { return ownerNic; }
    public void setOwnerNic(String ownerNic) { this.ownerNic = ownerNic; }

    public OwnerHotelRequest() {}
}