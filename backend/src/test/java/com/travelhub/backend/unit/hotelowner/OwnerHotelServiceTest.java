package com.travelhub.backend.unit.hotelowner;

import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.dto.response.OwnerHotelSummaryResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.service.ImageUploadService;
import com.travelhub.backend.service.OwnerHotelService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class OwnerHotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ImageUploadService imageUploadService;

    @InjectMocks
    private OwnerHotelService ownerHotelService;

    // ─────────────────────────────────────────────────────────────
    // Test 1: Access & Status — Dashboard loads for approved owner
    // ─────────────────────────────────────────────────────────────
    @Test(description = "getOwnerHotels with Approved status should return hotels list")
    public void getOwnerHotels_WhenStatusApproved_ShouldReturnHotels() {
        // ARRANGE
        Hotel h1 = Hotel.builder().id(1L).hotelName("Hotel 1").applicationStatus("Approved").build();
        when(hotelRepository.findByOwnerIdAndApplicationStatus(100L, "Approved"))
                .thenReturn(List.of(h1));

        // ACT
        List<HotelResponse> result = ownerHotelService.getOwnerHotels("Approved", 100L);

        // ASSERT
        assertNotNull(result);
        assertEquals(result.size(), 1);
        assertEquals(result.get(0).getHotelName(), "Hotel 1");
    }

    // ─────────────────────────────────────────────────────────────
    // Test 2: Access & Status — Dashboard locked/empty for pending
    // ─────────────────────────────────────────────────────────────
    @Test(description = "getOwnerHotels with Pending status should restrict access to approved features")
    public void getOwnerHotels_WhenStatusPending_ShouldReturnPendingHotels() {
        // ARRANGE
        Hotel h2 = Hotel.builder().id(2L).hotelName("Hotel 2").applicationStatus("Pending").build();
        when(hotelRepository.findByOwnerIdAndApplicationStatus(100L, "Pending"))
                .thenReturn(List.of(h2));

        // ACT
        List<HotelResponse> result = ownerHotelService.getOwnerHotels("Pending", 100L);

        // ASSERT
        assertNotNull(result);
        assertEquals(result.size(), 1);
        assertEquals(result.get(0).getApplicationStatus(), "Pending");
    }
    
    // ─────────────────────────────────────────────────────────────
    // Test 3: Dashboard Summary counts
    // ─────────────────────────────────────────────────────────────
    @Test(description = "getOwnerHotelSummary should return correct counts based on status")
    public void getOwnerHotelSummary_ShouldReturnCorrectCounts() {
        // ARRANGE
        when(hotelRepository.countByOwnerIdAndApplicationStatus(100L, "Approved")).thenReturn(2L);
        when(hotelRepository.countByOwnerIdAndApplicationStatus(100L, "Pending")).thenReturn(1L);
        when(hotelRepository.countByOwnerIdAndApplicationStatus(100L, "Rejected")).thenReturn(0L);
        
        // ACT
        OwnerHotelSummaryResponse summary = ownerHotelService.getOwnerHotelSummary(100L);
        
        // ASSERT
        assertNotNull(summary);
        assertEquals(summary.getApproved(), 2);
        assertEquals(summary.getPending(), 1);
        assertEquals(summary.getRejected(), 0);
        assertEquals(summary.getTotal(), 3);
    }
}
