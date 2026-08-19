package com.travelhub.backend.unit.hotelowner;

import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.service.ReviewService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewService reviewService;

    // ─────────────────────────────────────────────────────────────
    // Test 1: Reviews & Notifications — Display guest reviews
    // ─────────────────────────────────────────────────────────────
    @Test(description = "getHotelReviews should return list of reviews associated with the hotel")
    public void getHotelReviews_ShouldReturnListOfGuestReviews() {
        // ARRANGE
        Hotel hotel = Hotel.builder().id(1L).hotelName("Beach Hotel").build();
        Review r1 = Review.builder().id(101L).rating(5).title("Great!").hotel(hotel).build();
        Review r2 = Review.builder().id(102L).rating(4).title("Good").hotel(hotel).build();
        
        when(reviewRepository.findByHotel_Id(1L)).thenReturn(List.of(r1, r2));

        // ACT
        List<ReviewResponse> result = reviewService.getHotelReviews(1L);

        // ASSERT
        assertNotNull(result);
        assertEquals(result.size(), 2);
        assertEquals(result.get(0).getTitle(), "Great!");
        assertEquals(result.get(1).getTitle(), "Good");
        verify(reviewRepository, times(1)).findByHotel_Id(1L);
    }
}
