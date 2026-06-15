package com.travelhub.backend.entity;

import jakarta.persistence.*;

/**
 * PackageItinerary entity represents a daily plan within a travel package.
 * It describes the activities and events scheduled for a specific day of the trip.
 */
@Entity
@Table(name = "package_itinerary")
public class PackageItinerary {

    /**
     * Default constructor for JPA.
     */
    public PackageItinerary() {}
    
    // --- Getters and Setters ---
    
    public Integer getDayNumber() { return dayNumber; }
    public void setDayNumber(Integer dayNumber) { this.dayNumber = dayNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getActivities() { return activities; }
    public void setActivities(String activities) { this.activities = activities; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Package getPkg() { return pkg; }
    public void setPkg(Package pkg) { this.pkg = pkg; }

    // Unique identifier for the itinerary item record
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship: The specific travel package that this itinerary day belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package pkg;

    // The sequence number of the day (e.g., Day 1, Day 2)
    private Integer dayNumber;

    // A short summary or title for the day's plan
    @Column(nullable = false)
    private String title;

    // Detailed textual description of the day's plan and events
    @Column(columnDefinition = "TEXT")
    private String description;

    // Comma-separated list or description of specific activities (e.g., "Hiking", "Sightseeing")
    @Column(columnDefinition = "TEXT")
    private String activities;
}