package com.travelhub.backend.dto.response;

public class VehicleResponse {
    private Long id;
    private String ownerFirstName;
    private String ownerLastName;
    private String nicNumber;
    private String addressLine1;
    private String addressLine2;
    private String mobileNumber;
    private String secondaryMobileNumber;
    private String ownerEmail;
    private String vehicleType;
    private String brand;
    private String model;
    private String color;
    private String capacity;
    private String yearOfManufacture;
    private String registration;
    private String insuranceExpiryDate;
    private String vehicleImageFront;
    private String vehicleImageBack;
    private String vehicleImageSide;
    private String vehicleImageInside;
    private String status;
    private String lifecycleStatus;
    private String assignedDriverName;

    public VehicleResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOwnerFirstName() { return ownerFirstName; }
    public void setOwnerFirstName(String ownerFirstName) { this.ownerFirstName = ownerFirstName; }
    public String getOwnerLastName() { return ownerLastName; }
    public void setOwnerLastName(String ownerLastName) { this.ownerLastName = ownerLastName; }
    public String getNicNumber() { return nicNumber; }
    public void setNicNumber(String nicNumber) { this.nicNumber = nicNumber; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getSecondaryMobileNumber() { return secondaryMobileNumber; }
    public void setSecondaryMobileNumber(String secondaryMobileNumber) { this.secondaryMobileNumber = secondaryMobileNumber; }
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getCapacity() { return capacity; }
    public void setCapacity(String capacity) { this.capacity = capacity; }
    public String getYearOfManufacture() { return yearOfManufacture; }
    public void setYearOfManufacture(String yearOfManufacture) { this.yearOfManufacture = yearOfManufacture; }
    public String getRegistration() { return registration; }
    public void setRegistration(String registration) { this.registration = registration; }
    public String getInsuranceExpiryDate() { return insuranceExpiryDate; }
    public void setInsuranceExpiryDate(String insuranceExpiryDate) { this.insuranceExpiryDate = insuranceExpiryDate; }
    public String getVehicleImageFront() { return vehicleImageFront; }
    public void setVehicleImageFront(String vehicleImageFront) { this.vehicleImageFront = vehicleImageFront; }
    public String getVehicleImageBack() { return vehicleImageBack; }
    public void setVehicleImageBack(String vehicleImageBack) { this.vehicleImageBack = vehicleImageBack; }
    public String getVehicleImageSide() { return vehicleImageSide; }
    public void setVehicleImageSide(String vehicleImageSide) { this.vehicleImageSide = vehicleImageSide; }
    public String getVehicleImageInside() { return vehicleImageInside; }
    public void setVehicleImageInside(String vehicleImageInside) { this.vehicleImageInside = vehicleImageInside; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLifecycleStatus() { return lifecycleStatus; }
    public void setLifecycleStatus(String lifecycleStatus) { this.lifecycleStatus = lifecycleStatus; }
    public String getAssignedDriverName() { return assignedDriverName; }
    public void setAssignedDriverName(String assignedDriverName) { this.assignedDriverName = assignedDriverName; }

    public static class Builder {
        private Long id;
        private String ownerFirstName;
        private String ownerLastName;
        private String nicNumber;
        private String addressLine1;
        private String addressLine2;
        private String mobileNumber;
        private String secondaryMobileNumber;
        private String ownerEmail;
        private String vehicleType;
        private String brand;
        private String model;
        private String color;
        private String capacity;
        private String yearOfManufacture;
        private String registration;
        private String insuranceExpiryDate;
        private String vehicleImageFront;
        private String vehicleImageBack;
        private String vehicleImageSide;
        private String vehicleImageInside;
        private String status;
        private String lifecycleStatus;
        private String assignedDriverName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder ownerFirstName(String ownerFirstName) { this.ownerFirstName = ownerFirstName; return this; }
        public Builder ownerLastName(String ownerLastName) { this.ownerLastName = ownerLastName; return this; }
        public Builder nicNumber(String nicNumber) { this.nicNumber = nicNumber; return this; }
        public Builder addressLine1(String addressLine1) { this.addressLine1 = addressLine1; return this; }
        public Builder addressLine2(String addressLine2) { this.addressLine2 = addressLine2; return this; }
        public Builder mobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; return this; }
        public Builder secondaryMobileNumber(String secondaryMobileNumber) { this.secondaryMobileNumber = secondaryMobileNumber; return this; }
        public Builder ownerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; return this; }
        public Builder vehicleType(String vehicleType) { this.vehicleType = vehicleType; return this; }
        public Builder brand(String brand) { this.brand = brand; return this; }
        public Builder model(String model) { this.model = model; return this; }
        public Builder color(String color) { this.color = color; return this; }
        public Builder capacity(String capacity) { this.capacity = capacity; return this; }
        public Builder yearOfManufacture(String yearOfManufacture) { this.yearOfManufacture = yearOfManufacture; return this; }
        public Builder registration(String registration) { this.registration = registration; return this; }
        public Builder insuranceExpiryDate(String insuranceExpiryDate) { this.insuranceExpiryDate = insuranceExpiryDate; return this; }
        public Builder vehicleImageFront(String vehicleImageFront) { this.vehicleImageFront = vehicleImageFront; return this; }
        public Builder vehicleImageBack(String vehicleImageBack) { this.vehicleImageBack = vehicleImageBack; return this; }
        public Builder vehicleImageSide(String vehicleImageSide) { this.vehicleImageSide = vehicleImageSide; return this; }
        public Builder vehicleImageInside(String vehicleImageInside) { this.vehicleImageInside = vehicleImageInside; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder lifecycleStatus(String lifecycleStatus) { this.lifecycleStatus = lifecycleStatus; return this; }
        public Builder assignedDriverName(String assignedDriverName) { this.assignedDriverName = assignedDriverName; return this; }

        public VehicleResponse build() {
            VehicleResponse r = new VehicleResponse();
            r.setId(id);
            r.setOwnerFirstName(ownerFirstName);
            r.setOwnerLastName(ownerLastName);
            r.setNicNumber(nicNumber);
            r.setAddressLine1(addressLine1);
            r.setAddressLine2(addressLine2);
            r.setMobileNumber(mobileNumber);
            r.setSecondaryMobileNumber(secondaryMobileNumber);
            r.setOwnerEmail(ownerEmail);
            r.setVehicleType(vehicleType);
            r.setBrand(brand);
            r.setModel(model);
            r.setColor(color);
            r.setCapacity(capacity);
            r.setYearOfManufacture(yearOfManufacture);
            r.setRegistration(registration);
            r.setInsuranceExpiryDate(insuranceExpiryDate);
            r.setVehicleImageFront(vehicleImageFront);
            r.setVehicleImageBack(vehicleImageBack);
            r.setVehicleImageSide(vehicleImageSide);
            r.setVehicleImageInside(vehicleImageInside);
            r.setStatus(status);
            r.setLifecycleStatus(lifecycleStatus);
            r.setAssignedDriverName(assignedDriverName);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}