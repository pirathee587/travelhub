import useSWR from "swr";
import { api } from "@/features/tourist/services/api";

/**
 * SWR-based API hooks for data fetching with caching, deduplication,
 * background revalidation, and stale-while-revalidate strategy.
 *
 * Benefits:
 * - Instant cached responses on re-visit (no loading flash)
 * - Request deduplication (same key = same request)
 * - Background revalidation on focus/reconnect
 * - Automatic retry on error
 */

const defaultOptions = {
    revalidateOnFocus: false,        // Don't refetch on tab focus (reduces noise)
    revalidateOnReconnect: true,     // Refetch when network reconnects
    dedupingInterval: 10000,         // Dedupe identical requests within 10s
    errorRetryCount: 2,              // Retry failed requests twice
    keepPreviousData: true,          // Show stale data while revalidating
};

// ── Packages ─────────────────────────────────────────

export function useAllPackages() {
    return useSWR("packages", () => api.getAllPackages(), {
        ...defaultOptions,
        revalidateIfStale: true,
    });
}

export function usePackageById(id) {
    return useSWR(id ? `package-${id}` : null, () => api.getPackageById(id), defaultOptions);
}

export function usePackageReviews(packageId) {
    return useSWR(
        packageId ? `package-reviews-${packageId}` : null,
        () => api.getPackageReviews(packageId),
        defaultOptions
    );
}

export function usePackageRating(packageId) {
    return useSWR(
        packageId ? `package-rating-${packageId}` : null,
        () => api.getPackageAverageRating(packageId),
        defaultOptions
    );
}

// ── Hotels ───────────────────────────────────────────

export function useAllHotels(district = null) {
    const key = district && district !== "all"
        ? `hotels-district-${district}`
        : "hotels";
    return useSWR(key, () => api.getAllHotels(district), {
        ...defaultOptions,
        revalidateIfStale: true,
    });
}

export function useHotelById(id) {
    return useSWR(id ? `hotel-${id}` : null, () => api.getHotelById(id), defaultOptions);
}

export function useHotelImages(id) {
    return useSWR(id ? `hotel-images-${id}` : null, () => api.getHotelImages(id), {
        ...defaultOptions,
        fallbackData: [],
    });
}

export function useAllRooms() {
    return useSWR("rooms", () => api.getAllRooms(), {
        ...defaultOptions,
        revalidateIfStale: true,
    });
}

export function useHotelPriceRanges(hotelIds = []) {
    const normalizedIds = Array.isArray(hotelIds)
        ? [...hotelIds].filter(Boolean).sort((a, b) => a - b)
        : [];

    const key = normalizedIds.length > 0
        ? `hotel-price-ranges-${normalizedIds.join("-")}`
        : null;

    return useSWR(key, () => api.getHotelPriceRanges(normalizedIds), {
        ...defaultOptions,
        revalidateIfStale: true,
    });
}

export function useHotelReviews(hotelId) {
    return useSWR(
        hotelId ? `hotel-reviews-${hotelId}` : null,
        () => api.getHotelReviews(hotelId),
        defaultOptions
    );
}

export function useHotelRating(hotelId) {
    return useSWR(
        hotelId ? `hotel-rating-${hotelId}` : null,
        () => api.getHotelAverageRating(hotelId),
        defaultOptions
    );
}

export function useHotelRooms(hotelId) {
    return useSWR(
        hotelId ? `hotel-rooms-${hotelId}` : null,
        () => api.getHotelRooms(hotelId),
        defaultOptions
    );
}

// ── Dashboard / Overview ─────────────────────────────

export function useStats(userId) {
    return useSWR(
        userId ? `stats-${userId}` : null,
        () => api.getStats(userId),
        defaultOptions
    );
}

export function useTrips(userId) {
    return useSWR(
        userId ? `trips-${userId}` : null,
        () => api.getTrips(userId),
        defaultOptions
    );
}

export function useDocuments(userId) {
    return useSWR(
        userId ? `documents-${userId}` : null,
        () => api.getDocuments(userId),
        defaultOptions
    );
}

export function useRecommendations(userId) {
    return useSWR(
        userId ? `recommendations-${userId}` : null,
        () => api.getRecommendations(userId),
        defaultOptions
    );
}

export function useTopicRecommendations(userId) {
    return useSWR(
        userId ? `recommendations-topics-${userId}` : null,
        () => api.getTopicRecommendations(userId),
        defaultOptions
    );
}

// ── Agents ────────────────────────────────────────────

export function useAllAgents() {
    return useSWR("agents", () => api.getAllAgents(), {
        ...defaultOptions,
        revalidateIfStale: true,
    });
}

export function useAgentById(id) {
    return useSWR(id ? `agent-${id}` : null, () => api.getAgentById(id), defaultOptions);
}

// ── Current User Profile ──────────────────────────────────

/**
 * Fetch the profile of the currently active user.
 * Uses the hardcoded userId (32) for now.
 * TODO: When JWT is implemented, pass the userId from the auth token instead.
 */
export function useUserProfile(userId) {
    return useSWR(
        userId ? `user-profile-${userId}` : null,
        () => api.getUserProfile(userId),
        {
            ...defaultOptions,
            onSuccess: (data) => {
                // Cache the user name in localStorage so the header always has it
                // even before this hook's data loads on the next visit.
                if (data?.name) {
                    localStorage.setItem("userName", data.name);
                }
            },
        }
    );
}
