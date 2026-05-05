package com.travelhub.backend.dto.request;



public class DriverRequest {
    private String firstName;
    private String lastName;
    private String nic;
    private String bloodGroup;
    private String nicFrontImage;
    private String nicRearImage;
    private String email;
    private String mobileNumber;
    private String secondaryMobileNumber;
    private String addressLine1;
    private String addressLine2;
    private String licenseNumber;
    private String licenseExpiryDate;
    private String licenseFrontImage;
    private String licenseRearImage;
    private String vehicleTypes;
    private String profileImage;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getNicFrontImage() { return nicFrontImage; }
    public void setNicFrontImage(String nicFrontImage) { this.nicFrontImage = nicFrontImage; }
    public String getNicRearImage() { return nicRearImage; }
    public void setNicRearImage(String nicRearImage) { this.nicRearImage = nicRearImage; }
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
    public String getLicenseFrontImage() { return licenseFrontImage; }
    public void setLicenseFrontImage(String licenseFrontImage) { this.licenseFrontImage = licenseFrontImage; }
    public String getLicenseRearImage() { return licenseRearImage; }
    public void setLicenseRearImage(String licenseRearImage) { this.licenseRearImage = licenseRearImage; }
    public String getVehicleTypes() { return vehicleTypes; }
    public void setVehicleTypes(String vehicleTypes) { this.vehicleTypes = vehicleTypes; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public DriverRequest() {}
}