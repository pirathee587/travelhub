package com.travelhub.backend.controller.hotelowner;

import com.travelhub.backend.service.HotelService;
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
public class HotelControllerTest {

    @Mock
    private HotelService hotelService;

    @InjectMocks
    private com.travelhub.backend.controller.HotelController hotelController;

    @Test(description = "GET /api/hotels (no params) should return 200 with all approved hotels")
    public void getAllHotels_NoParams_ShouldReturn200() {
        when(hotelService.getAllHotels()).thenReturn(List.of());

        // HotelController.getAllHotels() has 2 optional @RequestParam (destination, district)
        // Pass null for both to simulate no filter
        var response = hotelController.getAllHotels(null, null);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        verify(hotelService, times(1)).getAllHotels();
    }

    @Test(description = "GET /api/hotels?destination=Colombo should filter by destination")
    public void getAllHotels_WithDestination_ShouldFilterByDestination() {
        when(hotelService.getHotelsByDestination("Colombo")).thenReturn(List.of());

        var response = hotelController.getAllHotels("Colombo", null);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        verify(hotelService, times(1)).getHotelsByDestination("Colombo");
    }
}
