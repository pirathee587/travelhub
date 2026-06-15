package com.travelhub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

/**
 * Hotel entity represents a lodging establishment in the system.
 * It stores property details, owner information, and links to rooms and amenities.
 */
@Entity
@Table(name = "hotels", schema = "public")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "amenityList", "rooms", "owner"})
public class Hotel {

    /**
     * Default constructor for JPA.
     */
    public Hotel() {}
    
    // --- Getters and Setters ---

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
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public Integer getNumberOfRooms() { return numberOfRooms; }
    public void setNumberOfRooms(Integer numberOfRooms) { this.numberOfRooms = numberOfRooms; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public String getOwnerNic() { return ownerNic; }
    public void setOwnerNic(String ownerNic) { this.ownerNic = ownerNic; }
    public String getNicImageUrl() { return nicImageUrl; }
    public void setNicImageUrl(String nicImageUrl) { this.nicImageUrl = nicImageUrl; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getHotlineNumber() { return hotlineNumber; }
    public void setHotlineNumber(String hotlineNumber) { this.hotlineNumber = hotlineNumber; }
    public String getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; }
    public List<Amenity> getAmenityList() { return amenityList; }
    public void setAmenityList(List<Amenity> amenityList) { this.amenityList = amenityList; }
    public List<Room> getRooms() { return rooms; }
    public void setRooms(List<Room> rooms) { this.rooms = rooms; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    public String getHotelEmail() { return hotelEmail; }
    public void setHotelEmail(String hotelEmail) { this.hotelEmail = hotelEmail; }
    public String getHotelContactNumber() { return hotelContactNumber; }
    public void setHotelContactNumber(String hotelContactNumber) { this.hotelContactNumber = hotelContactNumber; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    // Unique identifier for the hotel
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Basic Info ─────────────────────────────────────
    
    // Official name of the hotel
    @Column(nullable = false)
    private String hotelName;

    // Primary city or area destination
    @Column(nullable = false)
    private String destination;

    // Detailed physical location or address
    private String location;

    // Textual description of the hotel's features and services
    @Column(columnDefinition = "TEXT")
    private String description;

    // Minimum room price per night
    private Double priceFrom;
    
    // Maximum room price per night
    private Double priceTo;
    
    // URL or path to the hotel's primary image
    private String imageUrl;
    
    // The administrative district where the hotel is located
    private String district;
    
    // Average user rating based on reviews
    private Double rating;
    
    // Total number of reviews received
    private Integer reviewCount;
    
    // Total capacity or number of rooms in the hotel
    private Integer numberOfRooms;
    
    // Comma-separated or serialized list of available amenities (simplified)
    private String amenities;

    // ── Owner Information ──────────────────────────────
    
    // Full name of the hotel owner
    @Column(name = "owner_name")
    private String ownerName;

    // Contact email of the hotel owner
    @Column(name = "owner_email")
    private String ownerEmail;

    // NIC (National Identity Card) number of the owner
    @Column(name = "owner_nic")
    private String ownerNic;

    // URL or path to the owner's NIC image for verification
    @Column(name = "nic_image_url")
    private String nicImageUrl;

    // Reference to the owner's user ID (mapped through the 'owner' relationship)
    @Column(name = "owner_id", insertable = false, updatable = false)
    private Long ownerId;

    // ── Contact Information ────────────────────────────
    
    // Official email address of the hotel
    @Column(name = "hotel_email")
    private String hotelEmail;

    // Primary contact number for hotel inquiries
    @Column(name = "hotel_contact_number")
    private String hotelContactNumber;

    // Secondary phone number
    @Column(name = "phone_number")
    private String phoneNumber;

    // Dedicated hotline number for customer support
    @Column(name = "hotline_number")
    private String hotlineNumber;

    // ── Application Status ─────────────────────────────
    
    // Current status of the hotel registration (e.g., Pending, Approved, Rejected)
    @Column(name = "application_status")
    private String applicationStatus = "Pending";

    // Relationship: List of specific amenities linked to this hotel
    @OneToMany(mappedBy = "hotel",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Amenity> amenityList;

    // Relationship: List of rooms available in this hotel
    @OneToMany(mappedBy = "hotel",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Room> rooms;

    // Relationship: The User (Hotel Owner) who manages this property
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;
}