package com.travelhub.backend.dto.request;



public class AgentProfileRequest {
    private String agentName;
    private String phone;
    private String secondaryPhone;
    private String whatsappNumber;
    private String location;
    private String bio;
    private String languages;
    private String operatingDistricts;
    private String websiteUrl;
    private String profileImage;
    private String companyName;
    private String agencyName;

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
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
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }

    public AgentProfileRequest() {}
}