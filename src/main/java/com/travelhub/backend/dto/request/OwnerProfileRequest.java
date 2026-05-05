package com.travelhub.backend.dto.request;



public class OwnerProfileRequest {
    private String name;
    private String telephone;
    private String profileImage;
    private String preferredLanguage;
    private String businessAddress;
    private String district;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getBusinessAddress() { return businessAddress; }
    public void setBusinessAddress(String businessAddress) { this.businessAddress = businessAddress; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public OwnerProfileRequest() {}
}