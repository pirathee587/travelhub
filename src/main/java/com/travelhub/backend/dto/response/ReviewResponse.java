package com.travelhub.backend.dto.response;

import java.util.List;

public class ReviewResponse {
    private Long id;
    private String userName;
    private String reviewDate;
    private Integer rating;
    private String title;
    private String comment;
    private List<String> imageUrls;
    private String customerName;
    private String date;
    private String trip;
    private String packageName;
    private String reply;
    private Boolean hasReply;

    public ReviewResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getReviewDate() { return reviewDate; }
    public void setReviewDate(String reviewDate) { this.reviewDate = reviewDate; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTrip() { return trip; }
    public void setTrip(String trip) { this.trip = trip; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public Boolean getHasReply() { return hasReply; }
    public void setHasReply(Boolean hasReply) { this.hasReply = hasReply; }

    public static class Builder {
        private Long id;
        private String userName;
        private String reviewDate;
        private Integer rating;
        private String title;
        private String comment;
        private List<String> imageUrls;
        private String customerName;
        private String date;
        private String trip;
        private String packageName;
        private String reply;
        private Boolean hasReply;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userName(String userName) { this.userName = userName; return this; }
        public Builder reviewDate(String reviewDate) { this.reviewDate = reviewDate; return this; }
        public Builder rating(Integer rating) { this.rating = rating; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder comment(String comment) { this.comment = comment; return this; }
        public Builder imageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; return this; }
        public Builder customerName(String customerName) { this.customerName = customerName; return this; }
        public Builder date(String date) { this.date = date; return this; }
        public Builder trip(String trip) { this.trip = trip; return this; }
        public Builder packageName(String packageName) { this.packageName = packageName; return this; }
        public Builder reply(String reply) { this.reply = reply; return this; }
        public Builder hasReply(Boolean hasReply) { this.hasReply = hasReply; return this; }

        public ReviewResponse build() {
            ReviewResponse r = new ReviewResponse();
            r.setId(id);
            r.setUserName(userName);
            r.setReviewDate(reviewDate);
            r.setRating(rating);
            r.setTitle(title);
            r.setComment(comment);
            r.setImageUrls(imageUrls);
            r.setCustomerName(customerName);
            r.setDate(date);
            r.setTrip(trip);
            r.setPackageName(packageName);
            r.setReply(reply);
            r.setHasReply(hasReply);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}