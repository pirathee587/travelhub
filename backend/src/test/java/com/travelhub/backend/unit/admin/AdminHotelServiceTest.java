package com.travelhub.backend.unit.admin;

import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.RoomRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.AdminHotelService;
import com.travelhub.backend.service.HotelPricingService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.context.ApplicationEventPublisher;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class AdminHotelServiceTest {

    // AdminHotelService has 7 dependencies — all must be mocked
    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private AmenityRepository amenityRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private HotelPricingService hotelPricingService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AdminHotelService adminHotelService;

    @Test(description = "getAllHotels should return all hotels with ratings")
    public void getAllHotels_ShouldReturnAllHotels() {
        Hotel h1 = Hotel.builder().id(1L).hotelName("Grand Hotel").build();
        Hotel h2 = Hotel.builder().id(2L).hotelName("City Inn").build();

        when(hotelRepository.findAll()).thenReturn(List.of(h1, h2));
        when(reviewRepository.getAverageRatingsByHotelIds(anyList())).thenReturn(Map.of());
        when(reviewRepository.getReviewCountsByHotelIds(anyList())).thenReturn(Map.of());
        when(hotelPricingService.getPriceRangesByHotelIds(anyList())).thenReturn(Map.of());
        when(roomRepository.findByHotelId(anyLong())).thenReturn(List.of());

        var result = adminHotelService.getAllHotels();

        assertNotNull(result);
        assertEquals(result.size(), 2);
        verify(hotelRepository, times(1)).findAll();
    }

    @Test(description = "getAllHotels should return empty list when no hotels exist")
    public void getAllHotels_WhenNoHotels_ShouldReturnEmptyList() {
        when(hotelRepository.findAll()).thenReturn(List.of());

        var result = adminHotelService.getAllHotels();

        assertTrue(result.isEmpty());
    }

    @Test(description = "approveHotel should publish event and update status to Approved")
    public void approveHotel_ShouldSetApplicationStatusToApproved() {
        Hotel hotel = Hotel.builder()
                .id(1L)
                .hotelName("Grand Hotel")
                .applicationStatus("Pending")
                .build();
        // Owner needed for event — set to null-safe with a mock user
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenReturn(hotel);
        doNothing().when(eventPublisher).publishEvent(any());

        adminHotelService.approveHotel(1L);

        assertEquals(hotel.getApplicationStatus(), "Approved");
        verify(hotelRepository, times(1)).save(hotel);
        verify(eventPublisher, times(1)).publishEvent(any());
    }

    @Test(description = "approveHotel should throw when hotel not found")
    public void approveHotel_WhenHotelNotFound_ShouldThrow() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminHotelService.approveHotel(99L));
    }
}
