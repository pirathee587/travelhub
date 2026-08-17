
package com.travelhub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "hotels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "amenityList", "rooms", "owner"})
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

    // ── Owner Information (Dropped from hotels table in V6, mapped to owner User) ──
    @Transient
    private String ownerName;

    @Transient
    private String ownerEmail;

    @Transient
    private String ownerNic;

    @Transient
    private String nicImageUrl;

    public String getOwnerName() {
        return owner != null ? owner.getName() : ownerName;
    }

    public String getOwnerEmail() {
        return owner != null ? owner.getEmail() : ownerEmail;
    }

    public String getOwnerNic() {
        return (owner != null && owner.getNicNumber() != null) ? owner.getNicNumber() : ownerNic;
    }

    public String getNicImageUrl() {
        return (owner != null && owner.getNicImage() != null) ? owner.getNicImage() : nicImageUrl;
    }

    @Column(name = "owner_id", insertable = false, updatable = false)
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

    // ── Application Status ─────────────────────────────
    // Pending, Approved, Rejected
    @Column(name = "application_status")
    @Builder.Default
    private String applicationStatus = "Pending";

    @Column(name = "nic_rear_image_url")
    private String nicRearImageUrl;

    @Column(name = "business_registration_image_url")
    private String businessRegistrationImageUrl;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

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
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private User owner;
}