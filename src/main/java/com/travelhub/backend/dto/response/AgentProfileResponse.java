package com.travelhub.backend.dto.response;

public class AgentProfileResponse {
    private Long id;
    private String agentName;
    private String email;
    private String phone;
    private String secondaryPhone;
    private String whatsappNumber;
    private String companyName;
    private String agencyName;
    private String location;
    private String bio;
    private String languages;
    private String operatingDistricts;
    private String websiteUrl;
    private String profileImage;
    private String memberSince;
    private Double rating;
    private Integer totalTrips;
    private Integer totalRevenue;
    private Double completionRate;

    public AgentProfileResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSecondaryPhone() { return secondaryPhone; }
    public void setSecondaryPhone(String secondaryPhone) { this.secondaryPhone = secondaryPhone; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
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
    public String getMemberSince() { return memberSince; }
    public void setMemberSince(String memberSince) { this.memberSince = memberSince; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getTotalTrips() { return totalTrips; }
    public void setTotalTrips(Integer totalTrips) { this.totalTrips = totalTrips; }
    public Integer getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Integer totalRevenue) { this.totalRevenue = totalRevenue; }
    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }

    public static class Builder {
        private Long id;
        private String agentName;
        private String email;
        private String phone;
        private String secondaryPhone;
        private String whatsappNumber;
        private String companyName;
        private String agencyName;
        private String location;
        private String bio;
        private String languages;
        private String operatingDistricts;
        private String websiteUrl;
        private String profileImage;
        private String memberSince;
        private Double rating;
        private Integer totalTrips;
        private Integer totalRevenue;
        private Double completionRate;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder agentName(String agentName) { this.agentName = agentName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder secondaryPhone(String secondaryPhone) { this.secondaryPhone = secondaryPhone; return this; }
        public Builder whatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; return this; }
        public Builder companyName(String companyName) { this.companyName = companyName; return this; }
        public Builder agencyName(String agencyName) { this.agencyName = agencyName; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder bio(String bio) { this.bio = bio; return this; }
        public Builder languages(String languages) { this.languages = languages; return this; }
        public Builder operatingDistricts(String operatingDistricts) { this.operatingDistricts = operatingDistricts; return this; }
        public Builder websiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; return this; }
        public Builder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public Builder memberSince(String memberSince) { this.memberSince = memberSince; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder totalTrips(Integer totalTrips) { this.totalTrips = totalTrips; return this; }
        public Builder totalRevenue(Integer totalRevenue) { this.totalRevenue = totalRevenue; return this; }
        public Builder completionRate(Double completionRate) { this.completionRate = completionRate; return this; }

        public AgentProfileResponse build() {
            AgentProfileResponse r = new AgentProfileResponse();
            r.setId(id);
            r.setAgentName(agentName);
            r.setEmail(email);
            r.setPhone(phone);
            r.setSecondaryPhone(secondaryPhone);
            r.setWhatsappNumber(whatsappNumber);
            r.setCompanyName(companyName);
            r.setAgencyName(agencyName);
            r.setLocation(location);
            r.setBio(bio);
            r.setLanguages(languages);
            r.setOperatingDistricts(operatingDistricts);
            r.setWebsiteUrl(websiteUrl);
            r.setProfileImage(profileImage);
            r.setMemberSince(memberSince);
            r.setRating(rating);
            r.setTotalTrips(totalTrips);
            r.setTotalRevenue(totalRevenue);
            r.setCompletionRate(completionRate);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}