package com.travelhub.backend.controller.tourist;

import com.travelhub.backend.controller.ReviewController;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.dto.response.ReviewSummaryResponse;
import com.travelhub.backend.service.ReviewService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

    @Test(description = "GET /api/reviews/package/{packageId} should return review list")
    public void getPackageReviews_ShouldReturn200WithList() {
        ReviewResponse review = ReviewResponse.builder().id(1L).title("Great experience").rating(5).build();
        when(reviewService.getPackageReviews(10L)).thenReturn(List.of(review));

        ResponseEntity<List<ReviewResponse>> response = reviewController.getPackageReviews(10L);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        assertEquals(response.getBody().size(), 1);
        verify(reviewService, times(1)).getPackageReviews(10L);
    }

    @Test(description = "GET /api/reviews/hotel/{hotelId} should return hotel reviews")
    public void getHotelReviews_ShouldReturn200WithList() {
        ReviewResponse review = ReviewResponse.builder().id(2L).title("Wonderful stay").rating(4).build();
        when(reviewService.getHotelReviews(20L)).thenReturn(List.of(review));

        ResponseEntity<List<ReviewResponse>> response = reviewController.getHotelReviews(20L);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertEquals(response.getBody().size(), 1);
        verify(reviewService, times(1)).getHotelReviews(20L);
    }

    @Test(description = "GET /api/reviews/user/{userId} should return user reviews")
    public void getUserReviews_ShouldReturn200WithList() {
        ReviewResponse review = ReviewResponse.builder().id(3L).userName("Tourist One").rating(5).build();
        when(reviewService.getUserReviews(1L)).thenReturn(List.of(review));

        ResponseEntity<List<ReviewResponse>> response = reviewController.getUserReviews(1L);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertEquals(response.getBody().size(), 1);
        verify(reviewService, times(1)).getUserReviews(1L);
    }

    @Test(description = "GET /api/reviews/package/{packageId}/rating should return summary")
    public void getPackageRatingSummary_ShouldReturn200WithRating() {
        when(reviewService.getAveragePackageRating(10L)).thenReturn(4.8);
        when(reviewService.getPackageReviewCount(10L)).thenReturn(15L);

        ResponseEntity<ReviewSummaryResponse> response = reviewController.getPackageRatingSummary(10L);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        assertEquals(response.getBody().getAverageRating(), 4.8);
        assertEquals(response.getBody().getReviewCount(), 15L);
    }

    @Test(description = "DELETE /api/reviews/{reviewId}?userId=1 should delete review and return 204")
    public void deleteReview_ShouldReturn204NoContent() {
        doNothing().when(reviewService).deleteReview(1L, 10L);

        ResponseEntity<Void> response = reviewController.deleteReview(1L, 10L);

        assertEquals(response.getStatusCode(), HttpStatus.NO_CONTENT);
        verify(reviewService, times(1)).deleteReview(1L, 10L);
    }
}
