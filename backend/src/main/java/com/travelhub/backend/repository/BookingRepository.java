package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.time.LocalDate;

@Repository
public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    // ── Existing ──────────────────────────────────────
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUserIdAndStatus(
            Long userId, String status);
    Long countByUserIdAndStatus(
            Long userId, String status);

    Long countByPkg_Id(Long pkgId);




    @Query("SELECT b FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId")
    List<Booking> findByAgentId(
            @Param("agentId") Long agentId);


    @Query("SELECT b FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND LOWER(b.status) = LOWER(:status)")
    List<Booking> findByAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);


    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND LOWER(b.status) = LOWER(:status)")
    Long countByAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);

    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND LOWER(b.status) IN :statuses")
    Long countByAgentIdAndStatusIn(
            @Param("agentId") Long agentId,
            @Param("statuses") List<String> statuses);

    // Vehicle Agent Bookings
    @Query("SELECT b FROM Booking b " +
            "JOIN b.vehicle v " +
            "WHERE v.agent.id = :agentId")
    List<Booking> findByVehicleAgentId(
            @Param("agentId") Long agentId);

    @Query("SELECT b FROM Booking b " +
            "JOIN b.vehicle v " +
            "WHERE v.agent.id = :agentId " +
            "AND b.status = :status")
    List<Booking> findByVehicleAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);

    Long countByStatus(String status);
    List<Booking> findByStatus(String status);

    @Query("SELECT b FROM Booking b JOIN FETCH b.pkg WHERE LOWER(b.status) IN ('completed', 'finished', 'done')")
    List<Booking> findCompletedBookingsWithPackages();

    @Query("SELECT b.driver.id FROM Booking b WHERE b.pkg.agent.id = :agentId AND LOWER(b.status) IN ('confirmed', 'in_progress', 'active', 'paid') AND b.driver IS NOT NULL AND b.startDate <= :endDate AND b.endDate >= :startDate")
    List<Long> findBookedDriverIds(@Param("agentId") Long agentId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT b.vehicle.id FROM Booking b WHERE b.pkg.agent.id = :agentId AND LOWER(b.status) IN ('confirmed', 'in_progress', 'active', 'paid') AND b.vehicle IS NOT NULL AND b.startDate <= :endDate AND b.endDate >= :startDate")
    List<Long> findBookedVehicleIds(@Param("agentId") Long agentId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value = "SELECT COUNT(DISTINCT b.id) FROM bookings b " +
            "LEFT JOIN booking_hotel_preferences bhp ON bhp.booking_id = b.id " +
            "WHERE (b.hotel_id = :hotelId OR bhp.hotel_id = :hotelId) " +
            "AND LOWER(b.status) NOT IN ('cancelled', 'rejected', 'completed')", nativeQuery = true)
    Long countActiveBookingsByHotelId(@Param("hotelId") Long hotelId);

    @Query(value = "SELECT COALESCE(b.hotel_id, bhp.hotel_id) AS hid, COUNT(DISTINCT b.id) " +
            "FROM bookings b " +
            "LEFT JOIN booking_hotel_preferences bhp ON bhp.booking_id = b.id " +
            "WHERE (b.hotel_id IN :hotelIds OR bhp.hotel_id IN :hotelIds) " +
            "AND LOWER(b.status) NOT IN ('cancelled', 'rejected', 'completed') " +
            "GROUP BY COALESCE(b.hotel_id, bhp.hotel_id)", nativeQuery = true)
    List<Object[]> findActiveBookingCountsByHotelIds(@Param("hotelIds") List<Long> hotelIds);

    @Modifying
    @Query(value = "UPDATE bookings SET hotel_id = NULL WHERE hotel_id = :hotelId", nativeQuery = true)
    void unlinkHotelFromBookings(@Param("hotelId") Long hotelId);

    @Modifying
    @Query(value = "DELETE FROM booking_hotel_preferences WHERE hotel_id = :hotelId", nativeQuery = true)
    void deleteBookingHotelPreferencesByHotelId(@Param("hotelId") Long hotelId);
}
