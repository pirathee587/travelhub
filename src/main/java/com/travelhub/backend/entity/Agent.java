package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "agents")
public class Agent {
    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String agencyName;
    private String licenseNumber;
    private String companyName;
    private String ownerName;
    private String secondaryPhone;
    private String whatsappNumber;
    private String location;
    private String bio;
    private String languages;
    private String operatingDistricts;
    private String websiteUrl;
    private LocalDate memberSince;
    private String nicImageUrl;
    private String applicationStatus = "Pending";
    private LocalDateTime submittedDate;
    private Double rating;
    private Integer totalTrips;
    private Integer totalRevenue;
    private Integer experienceYears;
    private Double completionRate;
    private Boolean isActive = true;

    public Agent() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getSecondaryPhone() { return secondaryPhone; }
    public void setSecondaryPhone(String secondaryPhone) { this.secondaryPhone = secondaryPhone; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }
    public String getOperatingDistricts() { return operatingDistricts; }
    public void setOperatingDistricts(String operatingDistricts) { this.operatingDistricts = operatingDistricts; }
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
    public LocalDate getMemberSince() { return memberSince; }
    public void setMemberSince(LocalDate memberSince) { this.memberSince = memberSince; }
    public String getNicImageUrl() { return nicImageUrl; }
    public void setNicImageUrl(String nicImageUrl) { this.nicImageUrl = nicImageUrl; }
    public String getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; }
    public LocalDateTime getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(LocalDateTime submittedDate) { this.submittedDate = submittedDate; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getTotalTrips() { return totalTrips; }
    public void setTotalTrips(Integer totalTrips) { this.totalTrips = totalTrips; }
    public Integer getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Integer totalRevenue) { this.totalRevenue = totalRevenue; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    @PrePersist
    protected void onCreate() {
        if (submittedDate == null) {
            submittedDate = LocalDateTime.now();
        }
    }
}