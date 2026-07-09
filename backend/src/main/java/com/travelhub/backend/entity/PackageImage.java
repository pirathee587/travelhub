package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "package_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package pkg;

    @Column(nullable = false)
    private String imageUrl;

    private Integer displayOrder;

    // NEW: store original filename for reference
    @Column(name = "original_file_name")
    private String originalFileName;
}