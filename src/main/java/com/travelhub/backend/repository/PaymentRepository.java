package com.travelhub.backend.repository;



import com.travelhub.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    // Transaction ID-ஆல் தேடு
    Optional<Payment> findByTransactionId(String transactionId);

    // Type-ஆல் filter (Payment / Refund)
    List<Payment> findByType(String type);

    // Status-ஆல் filter (Completed / Pending)
    List<Payment> findByStatus(String status);

    // Type + Status filter
    List<Payment> findByTypeAndStatus(
            String type, String status);

    // Total Revenue — Completed Payments மட்டும்
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) " +
            "FROM Payment p " +
            "WHERE p.type = 'Payment' " +
            "AND p.status = 'Completed'")
    Double getTotalRevenue();

    // Pending amount
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) " +
            "FROM Payment p " +
            "WHERE p.status = 'Pending'")
    Double getPendingAmount();

    // Total Refunds
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) " +
            "FROM Payment p " +
            "WHERE p.type = 'Refund' " +
            "AND p.status = 'Completed'")
    Double getTotalRefunds();

    // Pending count
    Long countByStatus(String status);

    // Booking-ஆல் தேடு
    List<Payment> findByBookingId(Long bookingId);

    // User-ஆல் தேடு
    List<Payment> findByUserId(Long userId);

    List<Payment> findByCreatedAtAfter(java.time.LocalDateTime startDate);
}