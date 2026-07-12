package com.travelhub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.travelhub.backend.entity.BookingHotelPreference;

@Repository
public interface BookingHotelPreferenceRepository extends JpaRepository<BookingHotelPreference, Long> {
    
    List<BookingHotelPreference> findByBookingIdOrderByPreferenceNumber(Long bookingId);
    
    List<BookingHotelPreference> findByBookingIdAndIsSelectedTrue(Long bookingId);
}
