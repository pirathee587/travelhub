package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * PaymentRepository provides data access methods for the Payment entity.
 * It includes queries for tracking transactions, calculating revenue, and monitoring refund status.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Finds a specific payment record using its unique external transaction ID
    Optional<Payment> findByTransactionId(String transactionId);

    // Retrieves payments filtered by their nature (e.g., "Payment", "Refund")
    List<Payment> findByType(String type);

    // Retrieves payments based on their current processing status (e.g., "Completed", "Pending")
    List<Payment> findByStatus(String status);

    // Retrieves payments filtered by both their type and processing status
    List<Payment> findByTypeAndStatus(String type, String status);

    // Calculates the total revenue generated from all completed "Payment" transactions
    @Query("SELECT COALESCE(SUM(p.amount), 0) " +
            "FROM Payment p " +
            "WHERE p.type = 'Payment' " +
            "AND p.status = 'Completed'")
    Double getTotalRevenue();

    // Calculates the total sum of payments that are currently in "Pending" status
    @Query("SELECT COALESCE(SUM(p.amount), 0) " +
            "FROM Payment p " +
            "WHERE p.status = 'Pending'")
    Double getPendingAmount();

    // Calculates the total amount that has been successfully refunded to users
    @Query("SELECT COALESCE(SUM(p.amount), 0) " +
            "FROM Payment p " +
            "WHERE p.type = 'Refund' " +
            "AND p.status = 'Completed'")
    Double getTotalRefunds();

    // Counts the number of payment records with a specific status (e.g., counting pending actions)
    Long countByStatus(String status);

    // Retrieves all payment attempts or records associated with a specific booking ID
    List<Payment> findByBookingId(Long bookingId);

    // Retrieves all payments made by a specific user
    List<Payment> findByUserId(Long userId);

    @Query("SELECT p FROM Payment p " +
            "JOIN FETCH p.booking b " +
            "JOIN FETCH b.pkg " +
            "WHERE p.user.id = :userId " +
            "ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdWithDetails(@Param("userId") Long userId);
    
    // Finds the most recent payment record for a given booking, ordered by creation date
    Optional<Payment> findFirstByBookingOrderByCreatedAtDesc(Booking booking);
}
