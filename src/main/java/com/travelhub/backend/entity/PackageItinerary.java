package com.travelhub.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "package_itinerary")




public class PackageItinerary {
    public PackageItinerary() {}
    
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package pkg;

    private Integer dayNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String activities;
}