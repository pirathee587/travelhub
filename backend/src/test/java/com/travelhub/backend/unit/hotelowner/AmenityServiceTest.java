package com.travelhub.backend.unit.hotelowner;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AmenityRequest;
import com.travelhub.backend.entity.Amenity;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.service.AmenityService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class AmenityServiceTest {

    @Mock
    private AmenityRepository amenityRepository;

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private AmenityService amenityService;

    // Helper: create a test hotel with given status
    private Hotel buildHotel(Long id, String status) {
        return Hotel.builder()
                .id(id)
                .hotelName("Test Hotel")
                .applicationStatus(status)
                .build();
    }

    // Helper: create a test amenity request
    private AmenityRequest buildRequest(String name, Long hotelId) {
        AmenityRequest req = new AmenityRequest();
        req.setName(name);
        req.setDescription("Test description");
        req.setIconName("wifi");
        req.setHotelId(hotelId);
        return req;
    }

    // ─────────────────────────────────────────────────────────────
    // Test 1: Add Amenity via Add Amenity Drawer — Approved hotel
    //         Amenity should be saved and returned successfully
    // ─────────────────────────────────────────────────────────────
    @Test(description = "addAmenity for approved hotel should save and display in Amenities Grid")
    public void addAmenity_ForApprovedHotel_ShouldSaveAndReturnAmenity() {
        // ARRANGE
        Hotel hotel = buildHotel(1L, "Approved");
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));

        Amenity savedAmenity = Amenity.builder()
                .id(10L)
                .name("WiFi")
                .description("Free high-speed WiFi")
                .iconName("wifi")
                .hotel(hotel)
                .build();
        when(amenityRepository.save(any(Amenity.class))).thenReturn(savedAmenity);

        AmenityRequest request = buildRequest("WiFi", 1L);

        // ACT
        Amenity result = amenityService.addAmenity(request);

        // ASSERT
        assertNotNull(result, "Saved amenity should not be null");
        assertEquals(result.getName(), "WiFi");
        assertEquals(result.getIconName(), "wifi");
        assertNotNull(result.getHotel(), "Amenity must be linked to a hotel");
        verify(amenityRepository, times(1)).save(any(Amenity.class));
    }

    // ─────────────────────────────────────────────────────────────
    // Test 2: Edit Amenity — Update name and icon for existing amenity
    //         Amenity should be updated and reflected in the grid
    // ─────────────────────────────────────────────────────────────
    @Test(description = "updateAmenity for approved hotel should update and return updated amenity")
    public void updateAmenity_ForApprovedHotel_ShouldUpdateSuccessfully() {
        // ARRANGE
        Hotel hotel = buildHotel(1L, "Approved");
        Amenity existingAmenity = Amenity.builder()
                .id(10L)
                .name("WiFi")
                .description("Old description")
                .iconName("wifi")
                .hotel(hotel)
                .build();
        when(amenityRepository.findById(10L)).thenReturn(Optional.of(existingAmenity));

        Amenity updatedAmenity = Amenity.builder()
                .id(10L)
                .name("Pool Access")
                .description("Access to rooftop pool")
                .iconName("pool")
                .hotel(hotel)
                .build();
        when(amenityRepository.save(any(Amenity.class))).thenReturn(updatedAmenity);

        AmenityRequest updateRequest = new AmenityRequest();
        updateRequest.setName("Pool Access");
        updateRequest.setDescription("Access to rooftop pool");
        updateRequest.setIconName("pool");
        updateRequest.setHotelId(1L);

        // ACT
        Amenity result = amenityService.updateAmenity(10L, updateRequest);

        // ASSERT
        assertNotNull(result, "Updated amenity should not be null");
        assertEquals(result.getName(), "Pool Access");
        assertEquals(result.getIconName(), "pool");
        verify(amenityRepository, times(1)).save(any(Amenity.class));
    }

    // ─────────────────────────────────────────────────────────────
    // Test 3: Remove Amenity — Delete from grid for approved hotel
    // ─────────────────────────────────────────────────────────────
    @Test(description = "deleteAmenity for approved hotel should remove amenity from grid")
    public void deleteAmenity_ForApprovedHotel_ShouldDeleteSuccessfully() {
        // ARRANGE
        Hotel hotel = buildHotel(1L, "Approved");
        Amenity amenity = Amenity.builder()
                .id(20L)
                .name("Parking")
                .hotel(hotel)
                .build();
        when(amenityRepository.findById(20L)).thenReturn(Optional.of(amenity));

        // ACT
        amenityService.deleteAmenity(20L);

        // ASSERT
        verify(amenityRepository, times(1)).delete(amenity);
    }

    // ─────────────────────────────────────────────────────────────
    // Test 4: Add Amenity — Hotel not approved (should throw)
    //         Action disabled for non-approved hotels
    // ─────────────────────────────────────────────────────────────
    @Test(description = "addAmenity for non-approved hotel should throw RuntimeException")
    public void addAmenity_ForPendingHotel_ShouldThrowException() {
        // ARRANGE
        Hotel hotel = buildHotel(2L, "Pending");
        when(hotelRepository.findById(2L)).thenReturn(Optional.of(hotel));

        AmenityRequest request = buildRequest("Spa", 2L);

        // ACT + ASSERT
        RuntimeException thrown = expectThrows(RuntimeException.class,
                () -> amenityService.addAmenity(request));

        assertNotNull(thrown);
        assertTrue(thrown.getMessage().contains("Action disabled"),
                "Should indicate action is disabled for non-approved hotel");

        verify(amenityRepository, never()).save(any(Amenity.class));
    }

    // ─────────────────────────────────────────────────────────────
    // Test 5: Get Amenities by Hotel — Returns list for the hotel
    // ─────────────────────────────────────────────────────────────
    @Test(description = "getAmenitiesByHotelId should return all amenities for the hotel")
    public void getAmenitiesByHotelId_ShouldReturnAmenitiesList() {
        // ARRANGE
        Hotel hotel = buildHotel(1L, "Approved");
        Amenity a1 = Amenity.builder().id(1L).name("WiFi").hotel(hotel).build();
        Amenity a2 = Amenity.builder().id(2L).name("Pool").hotel(hotel).build();
        when(amenityRepository.findByHotelId(1L)).thenReturn(List.of(a1, a2));

        // ACT
        List<Amenity> result = amenityService.getAmenitiesByHotelId(1L);

        // ASSERT
        assertNotNull(result);
        assertEquals(result.size(), 2, "Should return 2 amenities for hotel 1");
        verify(amenityRepository, times(1)).findByHotelId(1L);
    }
}
