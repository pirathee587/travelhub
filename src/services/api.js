import { supabase } from "@/lib/supabase";

const BASE_URL = "http://localhost:8080/api";

const handleResponse = async (res) => {
    if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
    }
    return res.json();
};

export const api = {
    // Packages
    getAllPackages: () =>
        fetch(`${BASE_URL}/packages`).then(handleResponse).catch(() => []),

    getPackagesByCategory: (category) =>
        fetch(`${BASE_URL}/packages?category=${category}`).then(handleResponse).catch(() => []),

    getTrendingPackages: () =>
        fetch(`${BASE_URL}/packages/trending`).then(handleResponse).catch(() => []),

    getPackageById: (id) =>
        fetch(`${BASE_URL}/packages/${id}`).then(handleResponse).catch(() => null),

    // Hotels
    getAllHotels: () =>
        fetch(`${BASE_URL}/hotels`).then(handleResponse).catch(() => []),

    getHotelsByDestination: (destination) =>
        fetch(`${BASE_URL}/hotels?destination=${destination}`).then(handleResponse).catch(() => []),

    getHotelById: (id) =>
        fetch(`${BASE_URL}/hotels/${id}`).then(handleResponse).catch(() => null),

    // Tourist — Stats & Trips
    getStats: (userId) =>
        fetch(`${BASE_URL}/tourist/stats?userId=${userId}`).then(handleResponse).catch(() => ({})),

    getTrips: (userId) =>
        fetch(`${BASE_URL}/tourist/trips?userId=${userId}`).then(handleResponse).catch(() => []),

    getTripsByStatus: (userId, status) =>
        fetch(`${BASE_URL}/tourist/trips?userId=${userId}&status=${status}`).then(handleResponse).catch(() => []),

    getRecentTrips: (userId) =>
        fetch(`${BASE_URL}/tourist/trips/recent?userId=${userId}`).then(handleResponse).catch(() => []),

    getTripById: (id) =>
        fetch(`${BASE_URL}/tourist/trips/${id}`).then(handleResponse).catch(() => null),

    // Tourist — Bookings
    getBookings: (userId) =>
        fetch(`${BASE_URL}/tourist/bookings?userId=${userId}`).then(handleResponse).catch(() => []),

    getBookingById: (id) =>
        fetch(`${BASE_URL}/tourist/bookings/${id}`).then(handleResponse).catch(() => null),

    createBooking: (data) =>
        fetch(`${BASE_URL}/tourist/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(handleResponse).catch(() => ({})),

    cancelBooking: (id) =>
        fetch(`${BASE_URL}/tourist/bookings/${id}/cancel`, {
            method: "PUT"
        }).then(handleResponse).catch(() => ({})),

    // Tourist — Documents
    getDocuments: (userId) =>
        fetch(`${BASE_URL}/tourist/documents?userId=${userId}`).then(handleResponse).catch(() => []),

    getDocumentsByType: (userId, type) =>
        fetch(`${BASE_URL}/tourist/documents?userId=${userId}&type=${type}`).then(handleResponse).catch(() => []),

    //reviews

    /**
     * ✅ FIXED: was querying Supabase directly with wrong column names
     *    (packageId, userName, reviewDate don't exist as-is in Supabase schema).
     *    Now calls the Spring Boot backend which handles DB correctly.
     *    Backend returns: { id, userName, reviewDate, rating, title, comment }
     */
    getPackageReviews: (packageId) =>
        fetch(`${BASE_URL}/reviews/package/${packageId}`)
            .then(handleResponse)
            .catch(() => []),

    //hotel review
    getHotelReviews: (hotelId) =>
        fetch(`${BASE_URL}/reviews/hotel/${hotelId}`)
            .then(handleResponse)
            .catch(() => []),

    //average rating for package
    getPackageAverageRating: (packageId) =>
        fetch(`${BASE_URL}/reviews/package/${packageId}/rating`)
            .then(handleResponse)
            .catch(() => ({ averageRating: 0, reviewCount: 0 })),

    //average rating for hotel
    getHotelAverageRating: (hotelId) =>
        fetch(`${BASE_URL}/reviews/hotel/${hotelId}/rating`)
            .then(handleResponse)
            .catch(() => ({ averageRating: 0, reviewCount: 0 })),

    // Recommendation
    getRecommendations: (userId) =>
        fetch(`${BASE_URL}/tourist/recommendations?userId=${userId}`).then(handleResponse).catch(() => []),

    // Add Reviews
    addPackageReview: (packageId, data, images = []) => {
        const formData = new FormData();
        formData.append("review", JSON.stringify(data));
        images.forEach((img) => formData.append("images", img));

        return fetch(`${BASE_URL}/tourist/reviews/package/${packageId}`, {
            method: "POST",
            body: formData
        }).then(handleResponse);
    },
        
    addHotelReview: (hotelId, data, images = []) => {
        const formData = new FormData();
        formData.append("review", JSON.stringify(data));
        images.forEach((img) => formData.append("images", img));

        return fetch(`${BASE_URL}/tourist/reviews/hotel/${hotelId}`, {
            method: "POST",
            body: formData
        }).then(handleResponse);
    },
};
