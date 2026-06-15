package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * DocumentRepository provides data access methods for managing user-uploaded files.
 * It allows for retrieving documents based on their owner or associated booking.
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    // Retrieves all documents belonging to a specific user (e.g., passport scans, IDs)
    List<Document> findByUserId(Long userId);
    
    // Retrieves all documents specifically associated with a particular booking (e.g., tickets, vouchers)
    List<Document> findByBookingId(Long bookingId);
}