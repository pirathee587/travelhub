package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.dto.response.StatsResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final DocumentRepository documentRepository;
    private final BookingService bookingService;

    // Get stats for dashboard
    public StatsResponse getStats(Long userId) {
        Long totalTrips = (long) bookingRepository.findByUserId(userId).size();
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

    // Get recent trips for overview page (latest 3)
    public List<TripResponse> getRecentTrips(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(3)
                .map(booking -> bookingService.getTripsByUserId(userId)
                        .stream()
                        .filter(t -> t.getId().equals(booking.getId()))
                        .findFirst()
                        .orElse(null))
                .collect(Collectors.toList());
    }
}