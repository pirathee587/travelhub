package com.travelhub.backend.controller.tourist;

import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.service.BookingCreationService;
import com.travelhub.backend.service.BookingService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.http.HttpStatus;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private BookingCreationService bookingCreationService;

    @InjectMocks
    private com.travelhub.backend.controller.BookingController bookingController;

    @Test(description = "GET /api/tourist/trips?userId=1 (no status) should return all trips")
    public void getTrips_NoStatus_ShouldReturnAllTrips() {
        TripResponse trip = TripResponse.builder().id(1L).status("CONFIRMED").build();
        when(bookingService.getTripsByUserId(1L)).thenReturn(List.of(trip));

        // BookingController.getTrips(@RequestParam Long userId, @RequestParam String status)
        var response = bookingController.getTrips(1L, null);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertFalse(response.getBody().isEmpty());
        verify(bookingService, times(1)).getTripsByUserId(1L);
    }

    @Test(description = "GET /api/tourist/trips?userId=1&status=COMPLETED should filter by status")
    public void getTrips_WithStatus_ShouldFilterByStatus() {
        TripResponse trip = TripResponse.builder().id(2L).status("COMPLETED").build();
        when(bookingService.getTripsByUserIdAndStatus(1L, "COMPLETED")).thenReturn(List.of(trip));

        var response = bookingController.getTrips(1L, "COMPLETED");

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertEquals(response.getBody().size(), 1);
        verify(bookingService, times(1)).getTripsByUserIdAndStatus(1L, "COMPLETED");
    }

    @Test(description = "GET /api/tourist/bookings?userId=1 should return booking list")
    public void getBookings_ShouldReturn200_WithBookingList() {
        BookingResponse booking = BookingResponse.builder().id(1L).build();
        when(bookingService.getBookingsByUserId(1L)).thenReturn(List.of(booking));

        // BookingController.getBookings(@RequestParam Long userId)
        var response = bookingController.getBookings(1L);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertEquals(response.getBody().size(), 1);
        verify(bookingService, times(1)).getBookingsByUserId(1L);
    }
}
