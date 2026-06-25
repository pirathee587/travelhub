import { supabase } from "@/lib/supabase";

const BASE_URL = "http://localhost:8082/api";

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) {
        const errorMsg = data?.message || `API error: ${res.status}`;
        throw new Error(errorMsg);
    }
    return data;
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
    getAllHotels: (district = null) => {
        const url = district && district !== "all" 
            ? `${BASE_URL}/hotels?district=${encodeURIComponent(district)}` 
            : `${BASE_URL}/hotels`;
        return fetch(url).then(handleResponse).catch(() => []);
    },

    getHotelsByDestination: (destination) =>
        fetch(`${BASE_URL}/hotels?destination=${destination}`).then(handleResponse).catch(() => []),

    getHotelById: (id) =>
        fetch(`${BASE_URL}/hotels/${id}`).then(handleResponse).catch(() => null),

    // Fetch all images for a hotel from hotel_images table (ordered by display_order)
    getHotelImages: (id) =>
        fetch(`${BASE_URL}/hotels/${id}/images`).then(handleResponse).catch(() => []),

    getAllRooms: () =>
        fetch(`${BASE_URL}/rooms`).then(handleResponse).catch(() => []),

    // Hotel Rooms — fetched from Spring Boot backend
    getHotelRooms: (hotelId) =>
        fetch(`${BASE_URL}/rooms/hotel/${hotelId}`)
            .then(res => {
                console.log(`[API] GET /rooms/hotel/${hotelId} -> ${res.status}`);
                return handleResponse(res);
            })
            .then(data => {
                console.log(`[API] Rooms response for hotel ${hotelId}:`, data);
                return data;
            })
            .catch(err => {
                console.error(`[API] Error fetching rooms for hotel ${hotelId}:`, err);
                return [];
            }),
    

    //Calculate Hotel Min, Max price from room's prices
    getHotelPriceRanges: async (hotelIds = []) => {
        if (!Array.isArray(hotelIds) || hotelIds.length === 0) {
            return {};
        }

        const ranges = {};

        const settled = await Promise.allSettled(
            hotelIds.map(async (hotelId) => {
                const rooms = await api.getHotelRooms(hotelId);
                const validPrices = (Array.isArray(rooms) ? rooms : [])
                    .map((room) => Number(room?.price))
                    .filter((price) => Number.isFinite(price) && price > 0);

                if (validPrices.length === 0) {
                    return [hotelId, { priceFrom: null, priceTo: null }];
                }

                return [
                    hotelId,
                    {
                        priceFrom: Math.min(...validPrices),
                        priceTo: Math.max(...validPrices),
                    },
                ];
            })
        );

        settled.forEach((result) => {
            if (result.status === "fulfilled") {
                const [hotelId, range] = result.value;
                ranges[hotelId] = range;
            }
        });

        return ranges;
    },

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
            method: "POST",                                          //Post method to create booking
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(handleResponse)
        .catch((err) => {
            console.error("[API] Booking request failed:", err);
            throw err;  // ← Re-throw to ensure frontend catches it
        }),

    cancelBooking: (id) =>
        fetch(`${BASE_URL}/tourist/bookings/${id}/cancel`, {
            method: "PUT"
        }).then(handleResponse)
        .catch((err) => {
            console.error("[API] Cancel booking failed:", err);
            throw err;
        }),

    // Tourist — Documents
    getDocuments: (userId) =>
        fetch(`${BASE_URL}/tourist/documents?userId=${userId}`).then(handleResponse).catch(() => []),

    getDocumentsByType: (userId, type) =>
        fetch(`${BASE_URL}/tourist/documents?userId=${userId}&type=${type}`).then(handleResponse).catch(() => []),

    //package reviews
    getPackageReviews: (packageId) =>
        fetch(`${BASE_URL}/reviews/package/${packageId}`)
            .then(handleResponse)
            .catch(() => []),

    //hotel review
    getHotelReviews: (hotelId) =>
        fetch(`${BASE_URL}/reviews/hotel/${hotelId}`)
            .then(handleResponse)
            .catch(() => []),

    // Get all reviews created by a specific user
    getUserReviews: (userId) =>
        fetch(`${BASE_URL}/reviews/user/${userId}`)
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

    getTopicRecommendations: (userId) =>
        fetch(`${BASE_URL}/tourist/recommendations/topics?userId=${userId}`).then(handleResponse).catch(() => []),

                                                                // Add Package Reviews
    addPackageReview: (packageId, data, images = []) => {
        const formData = new FormData();
        formData.append("review", JSON.stringify(data));
        images.forEach((img) => formData.append("images", img));

        return fetch(`${BASE_URL}/tourist/reviews/package/${packageId}`, {              //API Call
            method: "POST",                                                             //Post Method
            body: formData
        }).then(handleResponse).catch((err) => {
            console.error("[API] Package review submission failed:", err);              //Error Handle
            throw err;
        });
    },
                                                                //Add Hotel Reviews
    addHotelReview: (hotelId, data, images = []) => {
        const formData = new FormData();
        formData.append("review", JSON.stringify(data));
        images.forEach((img) => formData.append("images", img));

        return fetch(`${BASE_URL}/tourist/reviews/hotel/${hotelId}`, {          //API Call
            method: "POST",                                                     //Post Method
            body: formData
        }).then(handleResponse).catch((err) => {
            console.error("[API] Hotel review submission failed:", err);        //Error Handliing
            throw err;
        });
    },

    // Update Package Review
    updatePackageReview: (reviewId, userId, data, images = []) => {
        const formData = new FormData();
        formData.append("review", JSON.stringify(data));
        formData.append("userId", userId.toString());
        images.forEach((img) => formData.append("images", img));

        return fetch(`${BASE_URL}/reviews/${reviewId}`, {
            method: "PUT",
            body: formData
        }).then(handleResponse).catch((err) => {
            console.error("[API] Package review update failed:", err);
            throw err;
        });
    },

    // Update Hotel Review
    updateHotelReview: (reviewId, userId, data, images = []) => {
        const formData = new FormData();
        formData.append("review", JSON.stringify(data));
        formData.append("userId", userId.toString());
        images.forEach((img) => formData.append("images", img));

        return fetch(`${BASE_URL}/reviews/${reviewId}`, {
            method: "PUT",
            body: formData
        }).then(handleResponse).catch((err) => {
            console.error("[API] Hotel review update failed:", err);
            throw err;
        });
    },

    // Delete Review (works for both package and hotel)
    deleteReview: (reviewId, userId) => {
        return fetch(`${BASE_URL}/reviews/${reviewId}?userId=${userId}`, {
            method: "DELETE"
        }).then((response) => {
            if (!response.ok) {
                return response.json().catch(() => ({ message: "Delete failed" }))
                    .then(err => { throw new Error(err.message || "Delete failed"); });
            }
            return { success: true };
        }).catch((err) => {
            console.error("[API] Review deletion failed:", err);
            throw err;
        });
    },
    // Agents — Public listing
    getAllAgents: () =>
        fetch(`${BASE_URL}/agents`).then(handleResponse).catch(() => []),

    getAgentById: (id) =>
        fetch(`${BASE_URL}/agents/${id}`).then(handleResponse).catch(() => null),

    // ── Current User Profile (dev mode: no JWT, userId passed explicitly) ──
    // TODO: When JWT is implemented, remove userId param and use the token instead.
    getUserProfile: (userId) =>
        fetch(`${BASE_URL}/tourist/profile?userId=${userId}`)
            .then(handleResponse)
            .catch(() => null),

    updateUserProfile: (userId, data) =>
        fetch(`${BASE_URL}/tourist/profile?userId=${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(handleResponse),
};
