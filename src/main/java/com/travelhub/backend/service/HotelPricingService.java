package com.travelhub.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.travelhub.backend.repository.RoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HotelPricingService {

    private final RoomRepository roomRepository;

    public Map<Long, PriceRange> getPriceRangesByHotelIds(List<Long> hotelIds) {
        if (hotelIds == null || hotelIds.isEmpty()) {
            return Map.of();
        }

        return roomRepository.findPriceRangesByHotelIdsRaw(hotelIds).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        this::toPriceRange
                ));
    }

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

    private PriceRange toPriceRange(Object[] row) {
        if (row == null || row.length < 3) {
            return null;
        }

        return new PriceRange(toDouble(row[1]), toDouble(row[2]));
    }

    private Double toDouble(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }

    public record PriceRange(Double priceFrom, Double priceTo) {}
}