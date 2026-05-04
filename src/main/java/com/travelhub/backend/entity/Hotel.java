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
    private String imageUrl;
    private String district;

    // ── Owner Information ──────────────────────────────
    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "owner_email")
    private String ownerEmail;

    @Column(name = "owner_nic")
    private String ownerNic;

    @Column(name = "nic_image_url")
    private String nicImageUrl;

    @Column(name = "owner_id")
    private Long ownerId;

    // ── Contact Information ────────────────────────────
    @Column(name = "hotel_email")
    private String hotelEmail;

    @Column(name = "hotel_contact_number")
    private String hotelContactNumber;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "hotline_number")
    private String hotlineNumber;

    @Column(name = "hotel_email")
    private String hotelEmail;

    @Column(name = "hotel_contact_number")
    private String hotelContactNumber;

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


    // ── Link to Owner (User entity) ──
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;
}