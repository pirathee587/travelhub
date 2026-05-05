package com.travelhub.backend.dto.response;

public class DriverResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String nic;
    private String bloodGroup;
    private String email;
    private String mobileNumber;
    private String secondaryMobileNumber;
    private String addressLine1;
    private String addressLine2;
    private String licenseNumber;
    private String licenseExpiryDate;
    private String vehicleTypes;
    private String status;
    private String lifecycleStatus;
    private Double rating;
    private String profileImage;
    private String assignedVehicle;

    public DriverResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getSecondaryMobileNumber() { return secondaryMobileNumber; }
    public void setSecondaryMobileNumber(String secondaryMobileNumber) { this.secondaryMobileNumber = secondaryMobileNumber; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getLicenseExpiryDate() { return licenseExpiryDate; }
    public void setLicenseExpiryDate(String licenseExpiryDate) { this.licenseExpiryDate = licenseExpiryDate; }
    public String getVehicleTypes() { return vehicleTypes; }
    public void setVehicleTypes(String vehicleTypes) { this.vehicleTypes = vehicleTypes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLifecycleStatus() { return lifecycleStatus; }
    public void setLifecycleStatus(String lifecycleStatus) { this.lifecycleStatus = lifecycleStatus; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getAssignedVehicle() { return assignedVehicle; }
    public void setAssignedVehicle(String assignedVehicle) { this.assignedVehicle = assignedVehicle; }

    public static class Builder {
        private Long id;
        private String firstName;
        private String lastName;
        private String nic;
        private String bloodGroup;
        private String email;
        private String mobileNumber;
        private String secondaryMobileNumber;
        private String addressLine1;
        private String addressLine2;
        private String licenseNumber;
        private String licenseExpiryDate;
        private String vehicleTypes;
        private String status;
        private String lifecycleStatus;
        private Double rating;
        private String profileImage;
        private String assignedVehicle;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder firstName(String firstName) { this.firstName = firstName; return this; }
        public Builder lastName(String lastName) { this.lastName = lastName; return this; }
        public Builder nic(String nic) { this.nic = nic; return this; }
        public Builder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder mobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; return this; }
        public Builder secondaryMobileNumber(String secondaryMobileNumber) { this.secondaryMobileNumber = secondaryMobileNumber; return this; }
        public Builder addressLine1(String addressLine1) { this.addressLine1 = addressLine1; return this; }
        public Builder addressLine2(String addressLine2) { this.addressLine2 = addressLine2; return this; }
        public Builder licenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; return this; }
        public Builder licenseExpiryDate(String licenseExpiryDate) { this.licenseExpiryDate = licenseExpiryDate; return this; }
        public Builder vehicleTypes(String vehicleTypes) { this.vehicleTypes = vehicleTypes; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder lifecycleStatus(String lifecycleStatus) { this.lifecycleStatus = lifecycleStatus; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public Builder assignedVehicle(String assignedVehicle) { this.assignedVehicle = assignedVehicle; return this; }

        public DriverResponse build() {
            DriverResponse r = new DriverResponse();
            r.setId(id);
            r.setFirstName(firstName);
            r.setLastName(lastName);
            r.setNic(nic);
            r.setBloodGroup(bloodGroup);
            r.setEmail(email);
            r.setMobileNumber(mobileNumber);
            r.setSecondaryMobileNumber(secondaryMobileNumber);
            r.setAddressLine1(addressLine1);
            r.setAddressLine2(addressLine2);
            r.setLicenseNumber(licenseNumber);
            r.setLicenseExpiryDate(licenseExpiryDate);
            r.setVehicleTypes(vehicleTypes);
            r.setStatus(status);
            r.setLifecycleStatus(lifecycleStatus);
            r.setRating(rating);
            r.setProfileImage(profileImage);
            r.setAssignedVehicle(assignedVehicle);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}