package com.travelhub.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.travelhub.backend.repository.RoomRepository;

/**
 * HotelPricingService calculates the price spectrum for hotels based on their registered room types.
 * It provides both bulk and single-property pricing ranges (Min and Max rates).
 */
@Service
public class HotelPricingService {

    private final RoomRepository roomRepository;

    /**
     * Constructor injection for room data access.
     */
    public HotelPricingService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    /**
     * Retrieves the price ranges for a list of hotel IDs in a single batch.
     * Maps the hotel ID to its respective PriceRange record.
     */
    public Map<Long, PriceRange> getPriceRangesByHotelIds(List<Long> hotelIds) {
        if (hotelIds == null || hotelIds.isEmpty()) {
            return Map.of();
        }

        // Execute bulk query and map raw results to structured PriceRange objects
        return roomRepository.findPriceRangesByHotelIdsRaw(hotelIds).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(), // Index 0: Hotel ID
                        this::toPriceRange
                ));
    }

    /**
     * Retrieves the price range for a single specific hotel.
     */
    public PriceRange getPriceRangeByHotelId(Long hotelId) {
        if (hotelId == null) {
            return null;
        }

        List<Object[]> rows = roomRepository.findPriceRangeByHotelIdRaw(hotelId);
        if (rows.isEmpty()) {
            return null;
        }

        return toPriceRange(rows.get(0));
    }

    /**
     * Maps a raw database row (Object array) to a structured PriceRange record.
     * Expected indices: [1] - Minimum price, [2] - Maximum price.
     */
    private PriceRange toPriceRange(Object[] row) {
        if (row == null || row.length < 3) {
            return null;
        }

        return new PriceRange(toDouble(row[1]), toDouble(row[2]));
    }

    /**
     * Safely converts a generic Object value to a Double.
     */
    private Double toDouble(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }

    /**
     * Immutable record to represent the starting and ending price for a property.
     */
    public record PriceRange(Double priceFrom, Double priceTo) {}
}