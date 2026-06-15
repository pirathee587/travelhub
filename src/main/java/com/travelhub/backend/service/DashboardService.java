package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.dto.response.StatsResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DashboardService aggregates high-level travel statistics and recent activity for the tourist overview.
 * It provides a snapshot of the user's travel history and upcoming itineraries.
 */
@Service
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final DocumentRepository documentRepository;
    private final BookingService bookingService;

    /**
     * Constructor injection for booking analytics and detailed trip mapping.
     */
    public DashboardService(BookingRepository bookingRepository, DocumentRepository documentRepository, BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.documentRepository = documentRepository;
        this.bookingService = bookingService;
    }

    /**
     * Aggregates core travel metrics for a user's dashboard cards.
     * Counts trips categorized by their current lifecycle status (ongoing, completed, upcoming).
     */
    public StatsResponse getStats(Long userId) {
        Long totalTrips = (long) bookingRepository.findByUserId(userId).size();
        
        // Count trips by specific operational states
        Long ongoingTrips = bookingRepository.countByUserIdAndStatus(userId, "in_progress");
        Long completedTrips = bookingRepository.countByUserIdAndStatus(userId, "completed");
        Long upcomingTrips = bookingRepository.countByUserIdAndStatus(userId, "confirmed");

        return StatsResponse.builder()
                .totalTrips(totalTrips)
                .ongoingTrips(ongoingTrips)
                .completedTrips(completedTrips)
                .upcomingTrips(upcomingTrips)
                .build();
    }

    /**
     * Retrieves the most recent booking activity for the dashboard overview.
     * Limits the result to the 3 latest trips, sorted by creation date.
     */
    public List<TripResponse> getRecentTrips(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                // Sort descending to get the newest bookings first
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(3)
                // Delegate to BookingService to resolve full TripResponse details
                .map(booking -> bookingService.getTripsByUserId(userId)
                        .stream()
                        .filter(t -> t.getId().equals(booking.getId()))
                        .findFirst()
                        .orElse(null))
                .collect(Collectors.toList());
    }
}