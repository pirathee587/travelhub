package com.travelhub.backend.unit.hotelowner;

import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.RoomRepository;
import com.travelhub.backend.service.HotelPricingService;
import com.travelhub.backend.service.HotelService;
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
public class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private HotelPricingService hotelPricingService;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private HotelService hotelService;

    @Test(description = "getAllHotels should return approved hotels only")
    public void getAllHotels_ShouldReturnApprovedHotels() {
        // HotelService.getAllHotels() calls findByApplicationStatus("Approved")
        Hotel h1 = Hotel.builder().id(1L).hotelName("Beach Resort").applicationStatus("Approved").build();
        Hotel h2 = Hotel.builder().id(2L).hotelName("Mountain Lodge").applicationStatus("Approved").build();
        when(hotelRepository.findByApplicationStatus("Approved")).thenReturn(List.of(h1, h2));
        when(reviewRepository.getAverageRatingsByHotelIds(anyList())).thenReturn(java.util.Map.of());
        when(reviewRepository.getReviewCountsByHotelIds(anyList())).thenReturn(java.util.Map.of());

        var result = hotelService.getAllHotels();

        assertNotNull(result);
        assertEquals(result.size(), 2);
        verify(hotelRepository, times(1)).findByApplicationStatus("Approved");
    }

    @Test(description = "getAllHotels should return empty list when no approved hotels")
    public void getAllHotels_WhenNoApprovedHotels_ShouldReturnEmpty() {
        when(hotelRepository.findByApplicationStatus("Approved")).thenReturn(List.of());

        var result = hotelService.getAllHotels();

        assertTrue(result.isEmpty());
    }

    @Test(description = "getHotelById should throw when hotel not found")
    public void getHotelById_WhenNotFound_ShouldThrow() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> hotelService.getHotelById(99L));
    }

    @Test(description = "getHotelById should return hotel with full image list from repository")
    public void getHotelById_ShouldReturnHotelWithImages() {
        Hotel h = Hotel.builder().id(57L).hotelName("Mountain View Hotel").imageUrl("main.jpg").build();
        when(hotelRepository.findById(57L)).thenReturn(Optional.of(h));
        when(hotelRepository.findImageUrlsByHotelId(57L)).thenReturn(List.of("img1.jpg", "img2.jpg", "img3.jpg"));
        when(reviewRepository.getAverageRatingByHotelId(57L)).thenReturn(4.5);
        when(reviewRepository.getReviewCountByHotelId(57L)).thenReturn(10L);

        var response = hotelService.getHotelById(57L);

        assertNotNull(response);
        assertEquals(response.getHotelName(), "Mountain View Hotel");
        assertEquals(response.getImages().size(), 3);
        assertEquals(response.getImages().get(0), "img1.jpg");
    }

    @Test(description = "getHotelImages should return images from repository")
    public void getHotelImages_ShouldReturnImagesFromRepository() {
        when(hotelRepository.findImageUrlsByHotelId(57L)).thenReturn(List.of("img1.jpg", "img2.jpg"));

        List<String> images = hotelService.getHotelImages(57L);

        assertEquals(images.size(), 2);
        assertTrue(images.contains("img1.jpg"));
    }

    @Test(description = "getHotelImages when empty should fallback to hotel imageUrl")
    public void getHotelImages_WhenEmpty_ShouldFallbackToHotelImageUrl() {
        Hotel h = Hotel.builder().id(57L).imageUrl("fallback.jpg").build();
        when(hotelRepository.findImageUrlsByHotelId(57L)).thenReturn(List.of());
        when(hotelRepository.findById(57L)).thenReturn(Optional.of(h));

        List<String> images = hotelService.getHotelImages(57L);

        assertEquals(images.size(), 1);
        assertEquals(images.get(0), "fallback.jpg");
    }
}
