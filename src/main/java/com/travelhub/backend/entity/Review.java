package com.travelhub.backend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * Review entity represents feedback provided by a user for a package, hotel, or agent.
 * It stores ratings, comments, and can include images and agent replies.
 */
@Entity
@Table(name = "reviews")
public class Review {

    /**
     * Default constructor for JPA.
     */
    public Review() {}

    // Unique identifier for the review
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship: The specific travel package being reviewed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private Package pkg;

    // Relationship: The specific hotel being reviewed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    // Relationship: The User who wrote the review
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Relationship: The Agent being reviewed (or the one who managed the reviewed package)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    // Relationship: Link to the specific booking that this review is associated with
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // Numeric rating given by the user (usually on a scale of 1-5)
    @Column(nullable = false)
    private Integer rating;

    // Detailed textual feedback from the user
    @Column(columnDefinition = "TEXT")
    private String comment;

    // Optional short title or headline for the review
    @Column(nullable = true, length = 255)
    private String title;

    // Display name of the user who submitted the review (often cached from User entity)
    @Column(name = "user_name")
    private String userName;

    // Textual response or reply provided by the agent/owner
    private String reply;

    // Timestamp of when the review was submitted
    @Column(name = "created_at", updatable = false)
    private LocalDateTime reviewDate;

    // Relationship: List of images uploaded as part of the review
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JsonIgnore // Prevent infinite recursion during JSON serialization
    private List<ReviewImage> images = new ArrayList<>();

    /**
     * Life-cycle hook to set the review submission date before persisting.
     */
    @PrePersist
    protected void onCreate() {
        reviewDate = LocalDateTime.now();
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Package getPkg() { return pkg; }
    public void setPkg(Package pkg) { this.pkg = pkg; }
    public Hotel getHotel() { return hotel; }
    public void setHotel(Hotel hotel) { this.hotel = hotel; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public LocalDateTime getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDateTime reviewDate) { this.reviewDate = reviewDate; }
    public List<ReviewImage> getImages() { return images; }
    public void setImages(List<ReviewImage> images) { this.images = images; }
}