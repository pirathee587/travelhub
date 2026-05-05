package com.travelhub.backend.dto.response;

public class OwnerProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String telephone;
    private String profileImage;
    private String preferredLanguage;
    private String businessAddress;
    private String district;
    private String businessRegistrationId;
    private String status;

    public OwnerProfileResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
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
    public String getBusinessRegistrationId() { return businessRegistrationId; }
    public void setBusinessRegistrationId(String businessRegistrationId) { this.businessRegistrationId = businessRegistrationId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static class Builder {
        private Long id;
        private String name;
        private String email;
        private String telephone;
        private String profileImage;
        private String preferredLanguage;
        private String businessAddress;
        private String district;
        private String businessRegistrationId;
        private String status;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder telephone(String telephone) { this.telephone = telephone; return this; }
        public Builder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public Builder preferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; return this; }
        public Builder businessAddress(String businessAddress) { this.businessAddress = businessAddress; return this; }
        public Builder district(String district) { this.district = district; return this; }
        public Builder businessRegistrationId(String businessRegistrationId) { this.businessRegistrationId = businessRegistrationId; return this; }
        public Builder status(String status) { this.status = status; return this; }

        public OwnerProfileResponse build() {
            OwnerProfileResponse r = new OwnerProfileResponse();
            r.setId(id);
            r.setName(name);
            r.setEmail(email);
            r.setTelephone(telephone);
            r.setProfileImage(profileImage);
            r.setPreferredLanguage(preferredLanguage);
            r.setBusinessAddress(businessAddress);
            r.setDistrict(district);
            r.setBusinessRegistrationId(businessRegistrationId);
            r.setStatus(status);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}