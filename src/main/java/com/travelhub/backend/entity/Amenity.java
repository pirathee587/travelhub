package com.travelhub.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Amenity entity represents a specific feature or service provided by a hotel.
 * Examples include "Free Wi-Fi", "Swimming Pool", or "Gym".
 */
@Entity
@Table(name = "amenities")
public class Amenity {

    /**
     * Default constructor for JPA.
     */
    public Amenity() {}
    
    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }
    public Hotel getHotel() { return hotel; }
    public void setHotel(Hotel hotel) { this.hotel = hotel; }

    // Unique identifier for the amenity record
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The display name of the amenity (e.g., "Air Conditioning")
    @Column(nullable = false)
    private String name;

    // Optional short description of what the amenity entails
    private String description;

    // Name of the icon (e.g., Bootstrap Icons or FontAwesome class) used to represent the amenity visually
    @Column(name = "icon_name")
    private String iconName;

    // Relationship: Link to the specific hotel that offers this amenity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @JsonIgnore // Prevent infinite recursion during JSON serialization
    private Hotel hotel;
}
