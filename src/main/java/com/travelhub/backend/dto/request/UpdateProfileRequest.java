package com.travelhub.backend.dto.request;



public class UpdateProfileRequest {
    private String name;
    private String telephone;
    private String profileImage;
    private String preferredLanguage;
    private String nationality;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
}
