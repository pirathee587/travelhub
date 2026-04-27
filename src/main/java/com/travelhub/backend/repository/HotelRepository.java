package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotelRepository
        extends JpaRepository<Hotel, Long> {

    // ── Existing ──────────────────────────────────────
    List<Hotel> findByDestinationIgnoreCase(
            String destination);



    // Pending, Approved, Rejected
    List<Hotel> findByApplicationStatus(
            String applicationStatus);
}