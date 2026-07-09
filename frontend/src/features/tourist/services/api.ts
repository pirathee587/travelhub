const BASE_URL = "http://localhost:8080/api";

const handleResponse = async (res: Response) => {
    const data = await res.json();
    if (!res.ok) {
        const errorMsg = data?.message || `API error: ${res.status}`;
        throw new Error(errorMsg);
    }
    return data;
};

const mapPackagePrices = (pkg: any) => {
    if (pkg && typeof pkg === 'object') {
        if (pkg.priceFrom !== undefined && pkg.priceFrom !== null) {
            pkg.basePriceAdult = pkg.priceFrom;
        }
        if (pkg.priceTo !== undefined && pkg.priceTo !== null) {
            pkg.basePriceChild = pkg.priceTo;
        } else {
            pkg.basePriceChild = pkg.priceFrom ? Math.round(pkg.priceFrom * 0.7) : 0;
        }
    }
    return pkg;
};

const mapPackagesPrices = (data: any) => {
    if (Array.isArray(data)) {
        return data.map(mapPackagePrices);
    }
    return mapPackagePrices(data);
};

export const api = {
    // Packages
    getAllPackages: () =>
        fetch(`${BASE_URL}/packages`).then(handleResponse).then(mapPackagesPrices).catch(() => []),

    getPackagesByCategory: (category: string) =>
        fetch(`${BASE_URL}/packages?category=${category}`).then(handleResponse).then(mapPackagesPrices).catch(() => []),

    getTrendingPackages: () =>
        fetch(`${BASE_URL}/packages/trending`).then(handleResponse).then(mapPackagesPrices).catch(() => []),

    getPackageById: (id: string | number) =>
        fetch(`${BASE_URL}/packages/${id}`).then(handleResponse).then(mapPackagePrices).catch(() => null),

    // Hotels
    getAllHotels: (district: string | null = null) => {
        const url = district && district !== "all" 
            ? `${BASE_URL}/hotels?district=${encodeURIComponent(district)}` 
            : `${BASE_URL}/hotels`;
        return fetch(url).then(handleResponse).catch(() => []);
    },

    getHotelsByDestination: (destination: string) =>
        fetch(`${BASE_URL}/hotels?destination=${destination}`).then(handleResponse).catch(() => []),

    getHotelById: (id: string | number) =>
        fetch(`${BASE_URL}/hotels/${id}`).then(handleResponse).catch(() => null),

    // Fetch all images for a hotel from hotel_images table (ordered by display_order)
    getHotelImages: (id: string | number) =>
        fetch(`${BASE_URL}/hotels/${id}/images`).then(handleResponse).catch(() => []),

    getAllRooms: () =>
        fetch(`${BASE_URL}/rooms`).then(handleResponse).catch(() => []),

    // Hotel Rooms — fetched from Spring Boot backend
    getHotelRooms: (hotelId: string | number) =>
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
    getHotelPriceRanges: async (hotelIds: any[] = []) => {
        if (!Array.isArray(hotelIds) || hotelIds.length === 0) {
            return {};
        }

        const ranges: Record<string | number, { priceFrom: number | null; priceTo: number | null }> = {};

        const settled = await Promise.allSettled(
            hotelIds.map(async (hotelId): Promise<[any, { priceFrom: number | null; priceTo: number | null }]> => {
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
    getStats: (userId: string | number) =>
        fetch(`${BASE_URL}/tourist/stats?userId=${userId}`).then(handleResponse).catch(() => ({})),

    getTrips: (userId: string | number) =>
        fetch(`${BASE_URL}/tourist/trips?userId=${userId}`).then(handleResponse).catch(() => []),

    getTripsByStatus: (userId: string | number, status: string) =>
        fetch(`${BASE_URL}/tourist/trips?userId=${userId}&status=${status}`).then(handleResponse).catch(() => []),

    getRecentTrips: (userId: string | number) =>
        fetch(`${BASE_URL}/tourist/trips/recent?userId=${userId}`).then(handleResponse).catch(() => []),

    getTripById: (id: string | number) =>
        fetch(`${BASE_URL}/tourist/trips/${id}`).then(handleResponse).catch(() => null),

    // Tourist — Bookings
    getBookings: (userId: string | number) =>
        fetch(`${BASE_URL}/tourist/bookings?userId=${userId}`).then(handleResponse).catch(() => []),

    getBookingById: (id: string | number) =>
        fetch(`${BASE_URL}/tourist/bookings/${id}`).then(handleResponse).catch(() => null),

    createBooking: (data: any) =>
        fetch(`${BASE_URL}/tourist/bookings`, {
            method: "POST",                                          //Post method to create booking
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(handleResponse)
        .catch((err) => {
            console.error("[API] Booking request failed:", err);
            throw err;  // ← Re-throw to ensure frontend catches it
        }),

    cancelBooking: (id: string | number) =>
        fetch(`${BASE_URL}/tourist/bookings/${id}/cancel`, {
            method: "PUT"
        }).then(handleResponse)
        .catch((err) => {
            console.error("[API] Cancel booking failed:", err);
            throw err;
        }),

    // Tourist — Documents
    getDocuments: (userId: string | number) =>
        fetch(`${BASE_URL}/tourist/documents?userId=${userId}`).then(handleResponse).catch(() => []),

    getDocumentsByType: (userId: string | number, type: string) =>
        fetch(`${BASE_URL}/tourist/documents?userId=${userId}&type=${type}`).then(handleResponse).catch(() => []),

    //package reviews
    getPackageReviews: (packageId: string | number) =>
        fetch(`${BASE_URL}/reviews/package/${packageId}`)
            .then(handleResponse)
            .catch(() => []),

    //hotel review
    getHotelReviews: (hotelId: string | number) =>
        fetch(`${BASE_URL}/reviews/hotel/${hotelId}`)
            .then(handleResponse)
            .catch(() => []),

    // Get all reviews created by a specific user
    getUserReviews: (userId: string | number) =>
        fetch(`${BASE_URL}/reviews/user/${userId}`)
            .then(handleResponse)
            .catch(() => []),

    //average rating for package
    getPackageAverageRating: (packageId: string | number) =>
        fetch(`${BASE_URL}/reviews/package/${packageId}/rating`)
            .then(handleResponse)
            .catch(() => ({ averageRating: 0, reviewCount: 0 })),

    //average rating for hotel
    getHotelAverageRating: (hotelId: string | number) =>
        fetch(`${BASE_URL}/reviews/hotel/${hotelId}/rating`)
            .then(handleResponse)
            .catch(() => ({ averageRating: 0, reviewCount: 0 })),

    // Recommendation
    getRecommendations: (userId: string | number) =>
        fetch(`${BASE_URL}/tourist/recommendations?userId=${userId}`).then(handleResponse).catch(() => []),

    getTopicRecommendations: (userId: string | number) =>
        fetch(`${BASE_URL}/tourist/recommendations/topics?userId=${userId}`).then(handleResponse).catch(() => []),

                                                                // Add Package Reviews
    addPackageReview: (packageId: string | number, data: any, images: any[] = []) => {
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
    addHotelReview: (hotelId: string | number, data: any, images: any[] = []) => {
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
    updatePackageReview: (reviewId: string | number, userId: string | number, data: any, images: any[] = []) => {
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
    updateHotelReview: (reviewId: string | number, userId: string | number, data: any, images: any[] = []) => {
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
    deleteReview: (reviewId: string | number, userId: string | number) => {
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

    getAgentById: (id: string | number) =>
        fetch(`${BASE_URL}/agents/${id}`).then(handleResponse).catch(() => null),

    // ── Current User Profile (dev mode: no JWT, userId passed explicitly) ──
    // TODO: When JWT is implemented, remove userId param and use the token instead.
    getUserProfile: (userId: string | number) =>
        fetch(`${BASE_URL}/tourist/profile?userId=${userId}`)
            .then(handleResponse)
            .catch(() => null),

    updateUserProfile: (userId: string | number, data: any) =>
        fetch(`${BASE_URL}/tourist/profile?userId=${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(handleResponse),
};
