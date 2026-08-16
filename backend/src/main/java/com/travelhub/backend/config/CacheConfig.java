package com.travelhub.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * In-Memory Caching Configuration for Tourist Portal.
 *
 * Configures Caffeine Cache Manager with bounded capacity and time-to-live (TTL) expiration.
 * Protects server memory while providing sub-millisecond data retrieval on frequent read paths.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_TOURIST_PACKAGES = "touristPackages";
    public static final String CACHE_TOURIST_PACKAGE_DETAILS = "touristPackageDetails";
    public static final String CACHE_TOURIST_HOTELS = "touristHotels";
    public static final String CACHE_TOURIST_HOTEL_DETAILS = "touristHotelDetails";
    public static final String CACHE_TOURIST_RECOMMENDATIONS = "touristRecommendations";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                CACHE_TOURIST_PACKAGES,
                CACHE_TOURIST_PACKAGE_DETAILS,
                CACHE_TOURIST_HOTELS,
                CACHE_TOURIST_HOTEL_DETAILS,
                CACHE_TOURIST_RECOMMENDATIONS
        );

        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .maximumSize(1000)
                        .recordStats()
        );

        return cacheManager;
    }
}
