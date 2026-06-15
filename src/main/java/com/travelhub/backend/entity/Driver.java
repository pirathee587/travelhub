package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Driver entity represents a vehicle driver managed by an agent.
 * It stores personal information, licensing data, and performance metrics.
 */
@Entity
@Table(name = "drivers")
public class Driver {
    
    // Unique identifier for the driver
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The agent who employs or manages this driver
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    // --- Personal Information ---
    private String firstName;
    private String lastName;
    private String nic;             // National Identity Card number
    private String bloodGroup;
    private String nicFrontImage;
    private String nicRearImage;
    private String profileImage;    // URL or path to the driver's profile picture

    // --- Contact Details ---
    private String email;
    private String mobileNumber;
    private String secondaryMobileNumber;
    private String addressLine1;
    private String addressLine2;

    // --- Licensing and Skills ---
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String licenseFrontImage;
    private String licenseRearImage;
    private String vehicleTypes;    // Types of vehicles the driver is licensed for (e.g., Car, Van)

    // --- Status and Performance ---
    private String status = "available";        // Current work status (e.g., available, on-trip)
    private String lifecycleStatus = "active";  // System status (active/inactive)
    private Double rating;                      // Overall performance rating from tourists/agents
    private String assignedVehicle;             // Simplified reference to the currently assigned vehicle

    /**
     * Default constructor for JPA.
     */
    public Driver() {}

    // --- Getters and Setters ---
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
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
    public LocalDate getLicenseExpiryDate() { return licenseExpiryDate; }
    public void setLicenseExpiryDate(LocalDate licenseExpiryDate) { this.licenseExpiryDate = licenseExpiryDate; }
    public String getLicenseFrontImage() { return licenseFrontImage; }
    public void setLicenseFrontImage(String licenseFrontImage) { this.licenseFrontImage = licenseFrontImage; }
    public String getLicenseRearImage() { return licenseRearImage; }
    public void setLicenseRearImage(String licenseRearImage) { this.licenseRearImage = licenseRearImage; }
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

    /**
     * Inner Builder class for the fluent creation of Driver objects.
     */
    public static class Builder {
        private Long id;
        private Agent agent;
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
        private LocalDate licenseExpiryDate;
        private String licenseFrontImage;
        private String licenseRearImage;
        private String vehicleTypes;
        private String status;
        private String lifecycleStatus;
        private Double rating;
        private String profileImage;
        private String assignedVehicle;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder agent(Agent agent) { this.agent = agent; return this; }
        public Builder firstName(String firstName) { this.firstName = firstName; return this; }
        public Builder lastName(String lastName) { this.lastName = lastName; return this; }
        public Builder nic(String nic) { this.nic = nic; return this; }
        public Builder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public Builder nicFrontImage(String nicFrontImage) { this.nicFrontImage = nicFrontImage; return this; }
        public Builder nicRearImage(String nicRearImage) { this.nicRearImage = nicRearImage; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder mobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; return this; }
        public Builder secondaryMobileNumber(String secondaryMobileNumber) { this.secondaryMobileNumber = secondaryMobileNumber; return this; }
        public Builder addressLine1(String addressLine1) { this.addressLine1 = addressLine1; return this; }
        public Builder addressLine2(String addressLine2) { this.addressLine2 = addressLine2; return this; }
        public Builder licenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; return this; }
        public Builder licenseExpiryDate(LocalDate licenseExpiryDate) { this.licenseExpiryDate = licenseExpiryDate; return this; }
        public Builder licenseFrontImage(String licenseFrontImage) { this.licenseFrontImage = licenseFrontImage; return this; }
        public Builder licenseRearImage(String licenseRearImage) { this.licenseRearImage = licenseRearImage; return this; }
        public Builder vehicleTypes(String vehicleTypes) { this.vehicleTypes = vehicleTypes; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder lifecycleStatus(String lifecycleStatus) { this.lifecycleStatus = lifecycleStatus; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public Builder assignedVehicle(String assignedVehicle) { this.assignedVehicle = assignedVehicle; return this; }

        /**
         * Builds and returns a Driver object based on the builder's configuration.
         */
        public Driver build() {
            Driver d = new Driver();
            d.setId(id);
            d.setAgent(agent);
            d.setFirstName(firstName);
            d.setLastName(lastName);
            d.setNic(nic);
            d.setBloodGroup(bloodGroup);
            d.setNicFrontImage(nicFrontImage);
            d.setNicRearImage(nicRearImage);
            d.setEmail(email);
            d.setMobileNumber(mobileNumber);
            d.setSecondaryMobileNumber(secondaryMobileNumber);
            d.setAddressLine1(addressLine1);
            d.setAddressLine2(addressLine2);
            d.setLicenseNumber(licenseNumber);
            d.setLicenseExpiryDate(licenseExpiryDate);
            d.setLicenseFrontImage(licenseFrontImage);
            d.setLicenseRearImage(licenseRearImage);
            d.setVehicleTypes(vehicleTypes);
            if (status != null) d.setStatus(status);
            if (lifecycleStatus != null) d.setLifecycleStatus(lifecycleStatus);
            d.setRating(rating);
            d.setProfileImage(profileImage);
            d.setAssignedVehicle(assignedVehicle);
            return d;
        }
    }

    /**
     * Returns a new Builder instance for Driver.
     */
    public static Builder builder() { return new Builder(); }
}