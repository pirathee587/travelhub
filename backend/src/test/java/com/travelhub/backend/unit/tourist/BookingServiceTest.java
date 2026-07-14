package com.travelhub.backend.unit.tourist;

import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.service.BookingService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private BookingService bookingService;

    @Test(description = "getTripsByUserId should return trips for valid user")
    public void getTripsByUserId_ShouldReturnTrips() {
        Booking booking = Booking.builder().id(1L).status("CONFIRMED").build();
        when(bookingRepository.findByUserId(1L)).thenReturn(List.of(booking));

        var result = bookingService.getTripsByUserId(1L);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(bookingRepository, times(1)).findByUserId(1L);
    }

    @Test(description = "getTripsByUserId should return empty list when user has no bookings")
    public void getTripsByUserId_WhenNoBookings_ShouldReturnEmptyList() {
        when(bookingRepository.findByUserId(999L)).thenReturn(List.of());

        var result = bookingService.getTripsByUserId(999L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test(description = "getTripsByUserIdAndStatus should filter by status")
    public void getTripsByUserIdAndStatus_ShouldFilterCorrectly() {
        Booking booking = Booking.builder().id(2L).status("COMPLETED").build();
        when(bookingRepository.findByUserIdAndStatus(1L, "COMPLETED")).thenReturn(List.of(booking));

        var result = bookingService.getTripsByUserIdAndStatus(1L, "COMPLETED");

        assertEquals(result.size(), 1);
    }

    @Test(description = "getBookingById should throw when booking not found")
    public void getBookingById_WhenNotFound_ShouldThrow() {
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> bookingService.getBookingById(99L));
    }

    @Test(description = "getBookingsByUserId should return all bookings for user")
    public void getBookingsByUserId_ShouldReturnBookings() {
        Booking b1 = Booking.builder().id(1L).status("PENDING").build();
        Booking b2 = Booking.builder().id(2L).status("CONFIRMED").build();
        when(bookingRepository.findByUserId(1L)).thenReturn(List.of(b1, b2));

        var result = bookingService.getBookingsByUserId(1L);

        assertEquals(result.size(), 2);
    }
}
