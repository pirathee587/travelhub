package com.travelhub.backend.dto.request;

import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * BookingRequest is a Data Transfer Object (DTO) used when a tourist initiates a new travel reservation.
 * It encapsulates the selection of a specific package, participating hotels, and assigned transportation.
 */
public class BookingRequest {
    
    // The unique identifier of the user making the booking
    private Long userId;

    // The primary travel package being reserved
    private Long packageId;

    // Optional: Single hotel selection (legacy support)
    private Long hotelId;

    // List of hotels included in the multi-day itinerary
    private List<Long> hotelIds;

    // Assigned vehicle for the duration of the trip
    private Long vehicleId;

    // Proposed start date for the travel experience
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    // Proposed end date for the travel experience
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    // Final calculated total price (inclusive of all services)
    private Double totalPrice;

    /**
     * Default constructor for framework instantiation.
     */
    public BookingRequest() {}

    // --- Standard Getters and Setters ---

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPackageId() { return packageId; }
    public void setPackageId(Long packageId) { this.packageId = packageId; }
    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
    public List<Long> getHotelIds() { return hotelIds; }
    public void setHotelIds(List<Long> hotelIds) { this.hotelIds = hotelIds; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
}