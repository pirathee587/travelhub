package com.travelhub.backend.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingResponse {
    private Long id;
    private String bookingId;
    private String packageName;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Double totalPrice;
    private Integer progress;
    private String imageUrl;
    private String category;
    private LocalDateTime bookedOn;
    private String hotelName;
    private String hotelLocation;
    private String driverName;
    private String driverPhone;
    private Double driverRating;
    private Integer driverTrips;
    private String vehicleType;
    private String vehicleModel;
    private String vehicleRegistration;
    private String vehicleCapacity;

    public BookingResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDateTime getBookedOn() { return bookedOn; }
    public void setBookedOn(LocalDateTime bookedOn) { this.bookedOn = bookedOn; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    public String getHotelLocation() { return hotelLocation; }
    public void setHotelLocation(String hotelLocation) { this.hotelLocation = hotelLocation; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    public Double getDriverRating() { return driverRating; }
    public void setDriverRating(Double driverRating) { this.driverRating = driverRating; }
    public Integer getDriverTrips() { return driverTrips; }
    public void setDriverTrips(Integer driverTrips) { this.driverTrips = driverTrips; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
    public String getVehicleRegistration() { return vehicleRegistration; }
    public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
    public String getVehicleCapacity() { return vehicleCapacity; }
    public void setVehicleCapacity(String vehicleCapacity) { this.vehicleCapacity = vehicleCapacity; }

    public static class Builder {
        private Long id;
        private String bookingId;
        private String packageName;
        private String destination;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private Double totalPrice;
        private Integer progress;
        private String imageUrl;
        private String category;
        private LocalDateTime bookedOn;
        private String hotelName;
        private String hotelLocation;
        private String driverName;
        private String driverPhone;
        private Double driverRating;
        private Integer driverTrips;
        private String vehicleType;
        private String vehicleModel;
        private String vehicleRegistration;
        private String vehicleCapacity;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder bookingId(String bookingId) { this.bookingId = bookingId; return this; }
        public Builder packageName(String packageName) { this.packageName = packageName; return this; }
        public Builder destination(String destination) { this.destination = destination; return this; }
        public Builder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public Builder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder totalPrice(Double totalPrice) { this.totalPrice = totalPrice; return this; }
        public Builder progress(Integer progress) { this.progress = progress; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder bookedOn(LocalDateTime bookedOn) { this.bookedOn = bookedOn; return this; }
        public Builder hotelName(String hotelName) { this.hotelName = hotelName; return this; }
        public Builder hotelLocation(String hotelLocation) { this.hotelLocation = hotelLocation; return this; }
        public Builder driverName(String driverName) { this.driverName = driverName; return this; }
        public Builder driverPhone(String driverPhone) { this.driverPhone = driverPhone; return this; }
        public Builder driverRating(Double driverRating) { this.driverRating = driverRating; return this; }
        public Builder driverTrips(Integer driverTrips) { this.driverTrips = driverTrips; return this; }
        public Builder vehicleType(String vehicleType) { this.vehicleType = vehicleType; return this; }
        public Builder vehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; return this; }
        public Builder vehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; return this; }
        public Builder vehicleCapacity(String vehicleCapacity) { this.vehicleCapacity = vehicleCapacity; return this; }

        public BookingResponse build() {
            BookingResponse r = new BookingResponse();
            r.setId(id);
            r.setBookingId(bookingId);
            r.setPackageName(packageName);
            r.setDestination(destination);
            r.setStartDate(startDate);
            r.setEndDate(endDate);
            r.setStatus(status);
            r.setTotalPrice(totalPrice);
            r.setProgress(progress);
            r.setImageUrl(imageUrl);
            r.setCategory(category);
            r.setBookedOn(bookedOn);
            r.setHotelName(hotelName);
            r.setHotelLocation(hotelLocation);
            r.setDriverName(driverName);
            r.setDriverPhone(driverPhone);
            r.setDriverRating(driverRating);
            r.setDriverTrips(driverTrips);
            r.setVehicleType(vehicleType);
            r.setVehicleModel(vehicleModel);
            r.setVehicleRegistration(vehicleRegistration);
            r.setVehicleCapacity(vehicleCapacity);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}