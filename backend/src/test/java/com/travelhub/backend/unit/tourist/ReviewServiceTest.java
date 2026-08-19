package com.travelhub.backend.unit.tourist;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewImageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.ImageUploadService;
import com.travelhub.backend.service.ReviewService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PackageRepository packageRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ReviewImageRepository reviewImageRepository;

    @Mock
    private ImageUploadService imageUploadService;

    @InjectMocks
    private ReviewService reviewService;

    @Test(description = "getPackageReviews should return review responses for package")
    public void getPackageReviews_ShouldReturnReviewList() {
        Package pkg = Package.builder().id(10L).packageName("Ella Adventure").build();
        User user = User.builder().id(1L).name("John Doe").build();
        Review review = Review.builder()
                .id(101L)
                .pkg(pkg)
                .user(user)
                .rating(5)
                .title("Amazing Tour")
                .comment("Had a wonderful time in Ella.")
                .reviewDate(LocalDateTime.now())
                .build();

        when(reviewRepository.findByPkg_Id(10L)).thenReturn(List.of(review));

        List<ReviewResponse> responses = reviewService.getPackageReviews(10L);

        assertNotNull(responses);
        assertEquals(responses.size(), 1);
        assertEquals(responses.get(0).getTitle(), "Amazing Tour");
        assertEquals(responses.get(0).getUserName(), "John Doe");
        verify(reviewRepository, times(1)).findByPkg_Id(10L);
    }

    @Test(description = "getHotelReviews should return review responses for hotel")
    public void getHotelReviews_ShouldReturnReviewList() {
        Hotel hotel = Hotel.builder().id(20L).hotelName("Grand Hotel").build();
        User user = User.builder().id(2L).name("Jane Smith").build();
        Review review = Review.builder()
                .id(102L)
                .hotel(hotel)
                .user(user)
                .rating(4)
                .title("Great stay")
                .comment("Clean rooms and polite staff.")
                .reviewDate(LocalDateTime.now())
                .build();

        when(reviewRepository.findByHotel_Id(20L)).thenReturn(List.of(review));

        List<ReviewResponse> responses = reviewService.getHotelReviews(20L);

        assertNotNull(responses);
        assertEquals(responses.size(), 1);
        assertEquals(responses.get(0).getHotelName(), "Grand Hotel");
        verify(reviewRepository, times(1)).findByHotel_Id(20L);
    }

    @Test(description = "getUserReviews should return all reviews by a user")
    public void getUserReviews_ShouldReturnUserReviews() {
        User user = User.builder().id(1L).name("John Doe").build();
        Review review = Review.builder().id(101L).user(user).rating(5).build();

        when(reviewRepository.findByUser_Id(1L)).thenReturn(List.of(review));

        List<ReviewResponse> responses = reviewService.getUserReviews(1L);

        assertNotNull(responses);
        assertEquals(responses.size(), 1);
        verify(reviewRepository, times(1)).findByUser_Id(1L);
    }

    @Test(description = "addPackageReview should persist and return review response")
    public void addPackageReview_ValidInput_ShouldPersistReview() {
        Package pkg = Package.builder().id(10L).packageName("Ella Tour").build();
        User user = User.builder().id(1L).name("John Doe").build();

        ReviewRequest request = new ReviewRequest();
        request.setUserId(1L);
        request.setRating(5);
        request.setTitle("Loved it");
        request.setComment("Great scenery and wonderful guide.");
        request.setUserName("John Doe");

        Review saved = Review.builder()
                .id(200L)
                .pkg(pkg)
                .user(user)
                .rating(5)
                .title("Loved it")
                .comment("Great scenery and wonderful guide.")
                .reviewDate(LocalDateTime.now())
                .images(new ArrayList<>())
                .build();

        when(packageRepository.findById(10L)).thenReturn(Optional.of(pkg));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reviewRepository.save(any(Review.class))).thenReturn(saved);

        ReviewResponse response = reviewService.addPackageReview(10L, request, null);

        assertNotNull(response);
        assertEquals(response.getId(), Long.valueOf(200L));
        assertEquals(response.getTitle(), "Loved it");
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test(description = "addPackageReview when package not found should throw RuntimeException")
    public void addPackageReview_PackageNotFound_ShouldThrow() {
        ReviewRequest request = new ReviewRequest();
        when(packageRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> reviewService.addPackageReview(999L, request, null));
    }

    @Test(description = "updateReview by review owner should update rating and comment")
    public void updateReview_AsOwner_ShouldUpdateSuccessfully() {
        User user = User.builder().id(1L).name("John Doe").build();
        Review existing = Review.builder()
                .id(101L)
                .user(user)
                .rating(4)
                .title("Good")
                .comment("It was good.")
                .images(new ArrayList<>())
                .build();

        ReviewRequest updateRequest = new ReviewRequest();
        updateRequest.setRating(5);
        updateRequest.setTitle("Updated: Excellent");
        updateRequest.setComment("Actually it was excellent!");

        when(reviewRepository.findById(101L)).thenReturn(Optional.of(existing));
        when(reviewRepository.save(any(Review.class))).thenReturn(existing);

        ReviewResponse response = reviewService.updateReview(101L, 1L, updateRequest, null);

        assertNotNull(response);
        assertEquals(existing.getRating(), Integer.valueOf(5));
        assertEquals(existing.getTitle(), "Updated: Excellent");
        verify(reviewRepository, times(1)).save(existing);
    }

    @Test(description = "updateReview by non-owner should throw Unauthorized exception")
    public void updateReview_NonOwner_ShouldThrowException() {
        User owner = User.builder().id(1L).build();
        Review existing = Review.builder().id(101L).user(owner).build();
        ReviewRequest updateRequest = new ReviewRequest();

        when(reviewRepository.findById(101L)).thenReturn(Optional.of(existing));

        RuntimeException ex = expectThrows(RuntimeException.class,
                () -> reviewService.updateReview(101L, 999L, updateRequest, null));
        assertTrue(ex.getMessage().contains("Unauthorized"));
    }

    @Test(description = "deleteReview by review owner should delete review")
    public void deleteReview_AsOwner_ShouldDeleteSuccessfully() {
        User user = User.builder().id(1L).build();
        Review existing = Review.builder().id(101L).user(user).images(new ArrayList<>()).build();

        when(reviewRepository.findById(101L)).thenReturn(Optional.of(existing));

        reviewService.deleteReview(101L, 1L);

        verify(reviewRepository, times(1)).delete(existing);
    }

    @Test(description = "deleteReview by non-owner should throw Unauthorized exception")
    public void deleteReview_NonOwner_ShouldThrowException() {
        User owner = User.builder().id(1L).build();
        Review existing = Review.builder().id(101L).user(owner).build();

        when(reviewRepository.findById(101L)).thenReturn(Optional.of(existing));

        RuntimeException ex = expectThrows(RuntimeException.class,
                () -> reviewService.deleteReview(101L, 999L));
        assertTrue(ex.getMessage().contains("Unauthorized"));
        verify(reviewRepository, never()).delete(any());
    }

    @Test(description = "getAveragePackageRating and count helpers return correct values")
    public void getAveragePackageRating_ShouldReturnComputedRating() {
        when(reviewRepository.getAverageRatingByPackageId(10L)).thenReturn(4.56);
        when(reviewRepository.getReviewCountByPackageId(10L)).thenReturn(12L);

        double avg = reviewService.getAveragePackageRating(10L);
        long count = reviewService.getPackageReviewCount(10L);

        assertEquals(avg, 4.6);
        assertEquals(count, 12L);
    }
}
