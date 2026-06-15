package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Booking entity represents a reservation made by a tourist.
 * It links users to packages, hotels, and vehicles for a specific travel period.
 */
@Entity
@Table(name = "bookings")
public class Booking {
    
    // Unique identifier for the booking
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user (tourist) who made the booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The travel package being booked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package pkg;

    // Optional hotel reservation associated with this booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    // The vehicle assigned/selected for this trip
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // Current status of the booking (e.g., confirmed, pending, cancelled)
    @Column(nullable = false)
    private String status;

    // Scheduled start date of the trip
    @Column(nullable = false)
    private LocalDate startDate;

    // Scheduled end date of the trip
    @Column(nullable = false)
    private LocalDate endDate;

    // Calculated total price for the booking
    private Double totalPrice;
    
    // Progress percentage of the trip (e.g., 0 for upcoming, 100 for completed)
    private Integer progress = 0;

    // Timestamp of when the booking was created in the system
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * Default constructor for JPA.
     */
    public Booking() {}
    
    // --- Getters and Setters ---
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Package getPkg() { return pkg; }
    public void setPkg(Package pkg) { this.pkg = pkg; }
    public Hotel getHotel() { return hotel; }
    public void setHotel(Hotel hotel) { this.hotel = hotel; }
    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    /**
     * Life-cycle hook to set the creation timestamp before the record is persisted.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}