const BASE_URL = "http://localhost:8080/api";

export const api = {
    // Packages
    getAllPackages: () =>
        fetch(`${BASE_URL}/packages`).then(res => res.json()),

    getPackagesByCategory: (category) =>
        fetch(`${BASE_URL}/packages?category=${category}`).then(res => res.json()),

    getTrendingPackages: () =>
        fetch(`${BASE_URL}/packages/trending`).then(res => res.json()),

    getPackageById: (id) =>
        fetch(`${BASE_URL}/packages/${id}`).then(res => res.json()),

    // Hotels
    getAllHotels: () =>
        fetch(`${BASE_URL}/hotels`).then(res => res.json()),

    getHotelsByDestination: (destination) =>
        fetch(`${BASE_URL}/hotels?destination=${destination}`).then(res => res.json()),

    getHotelById: (id) =>
        fetch(`${BASE_URL}/hotels/${id}`).then(res => res.json()),

    // Tourist — Stats & Trips
    getStats: (userId) =>
        fetch(`${BASE_URL}/tourist/stats?userId=${userId}`).then(res => res.json()),

    getTrips: (userId) =>
        fetch(`${BASE_URL}/tourist/trips?userId=${userId}`).then(res => res.json()),

    getTripsByStatus: (userId, status) =>
        fetch(`${BASE_URL}/tourist/trips?userId=${userId}&status=${status}`).then(res => res.json()),

    getRecentTrips: (userId) =>
        fetch(`${BASE_URL}/tourist/trips/recent?userId=${userId}`).then(res => res.json()),

    getTripById: (id) =>
        fetch(`${BASE_URL}/tourist/trips/${id}`).then(res => res.json()),

    // Tourist — Bookings
    getBookings: (userId) =>
        fetch(`${BASE_URL}/tourist/bookings?userId=${userId}`).then(res => res.json()),

    getBookingById: (id) =>
        fetch(`${BASE_URL}/tourist/bookings/${id}`).then(res => res.json()),

    createBooking: (data) =>
        fetch(`${BASE_URL}/tourist/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(res => res.json()),

    cancelBooking: (id) =>
        fetch(`${BASE_URL}/tourist/bookings/${id}/cancel`, {
            method: "PUT"
        }).then(res => res.json()),

    // Tourist — Documents
    getDocuments: (userId) =>
        fetch(`${BASE_URL}/tourist/documents?userId=${userId}`).then(res => res.json()),

    getDocumentsByType: (userId, type) =>
        fetch(`${BASE_URL}/tourist/documents?userId=${userId}&type=${type}`).then(res => res.json()),

    // Reviews
    getPackageReviews: (packageId) =>
        fetch(`${BASE_URL}/reviews/package/${packageId}`).then(res => res.json()),

    getHotelReviews: (hotelId) =>
        fetch(`${BASE_URL}/reviews/hotel/${hotelId}`).then(res => res.json()),

    //Recommendation
    getRecommendations: (userId) =>
        fetch(`${BASE_URL}/tourist/recommendations?userId=${userId}`).then(res => res.json()),

    //Add_Reviews
    addPackageReview: (packageId, data) =>
        fetch(`${BASE_URL}/tourist/reviews/package/${packageId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(res => res.json()),

    addHotelReview: (hotelId, data) =>
        fetch(`${BASE_URL}/tourist/reviews/hotel/${hotelId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(res => res.json()),
};