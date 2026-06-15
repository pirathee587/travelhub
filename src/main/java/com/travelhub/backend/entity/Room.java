package com.travelhub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * Room entity represents an individual room within a hotel.
 * It stores specific details like room type, pricing, and current availability.
 */
@Entity
@Table(name = "rooms")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "hotel"})
public class Room {

    /**
     * Default constructor for JPA.
     */
    public Room() {}

    // Unique identifier for the room (UUID or custom string ID)
    @Id
    private String id;

    // The name or number of the room
    @NotBlank(message = "Room name is required")
    private String name;

    // Type of the room (e.g., Single, Double, Deluxe, Suite)
    @NotBlank(message = "Room type is required")
    private String type;

    // Price per night for the room
    @Positive(message = "Price must be greater than zero")
    private Double price;

    // Textual description of the room's features and views
    private String description;

    // URL or path to an image of the room
    @Column(name = "image_url")
    private String imageUrl;
    
    // Current availability status of the room (true if available)
    private Boolean availability;

    // Relationship: The Hotel that this room belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    // --- Getters and Setters ---
    
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getAvailability() {
        return availability;
    }

    public void setAvailability(Boolean availability) {
        this.availability = availability;
    }

    public Hotel getHotel() {
        return hotel;
    }

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }
}