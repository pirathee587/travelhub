package com.travelhub.backend.dto.request;

import java.time.LocalDate;
import java.util.List;

public class BookingRequest {
    private Long userId;
    private Long packageId;
    private Long hotelId;
    private List<Long> hotelIds;
    private Long vehicleId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalPrice;

    public BookingRequest() {}

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