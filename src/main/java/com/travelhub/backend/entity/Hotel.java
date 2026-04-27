package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "hotels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Basic Info ─────────────────────────────────────
    @Column(nullable = false)
    private String hotelName;

    @Column(nullable = false)
    private String destination;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double priceFrom;
    private Double priceTo;
    private Double rating;
    private Integer reviewCount;
    private String imageUrl;
    private String district;

    // ── Location Details ───────────────────────────────
    @Column(name = "number_of_rooms")
    private Integer numberOfRooms;

    // ── Owner Information ──────────────────────────────
    @Column(name = "owner_name")
    private String ownerName;


    @Column(name = "owner_email")
    private String ownerEmail;

    @Column(name = "owner_nic")
    private String ownerNic;


    @Column(name = "nic_image_url")
    private String nicImageUrl;

    // ── Contact Information ────────────────────────────

    @Column(name = "phone_number")
    private String phoneNumber;


    @Column(name = "hotline_number")
    private String hotlineNumber;

    // ── Application Status ─────────────────────────────
    // Pending, Approved, Rejected
    @Column(name = "application_status")
    @Builder.Default
    private String applicationStatus = "Pending";

    // ── Amenities (Amenity entity-உடன் relationship) ──
    @OneToMany(mappedBy = "hotel",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Amenity> amenityList;

    // ── Rooms (Room entity-உடன் relationship) ─────────
    @OneToMany(mappedBy = "hotel",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Room> rooms;

    // ── Old amenities string field keep it ────────────
    @Column(columnDefinition = "TEXT")
    private String amenities;
}