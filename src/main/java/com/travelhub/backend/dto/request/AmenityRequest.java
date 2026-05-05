package com.travelhub.backend.dto.request;



public class AmenityRequest {
    private String name;
    private String description;
    private String iconName;
    private Long hotelId; // Added hotelId so amenities link to the correct hotel

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }
    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    public AmenityRequest() {}
}