
export const mockDocuments = [
    {
        title: "Bali Trip Invoice",
        type: "invoice",
        date: "Feb 5, 2026",
        size: "245 KB",
    },
    {
        title: "Payment Receipt #45892",
        type: "receipt",
        date: "Feb 5, 2026",
        size: "128 KB",
    },
    {
        title: "Travel Itinerary - Bali",
        type: "itinerary",
        date: "Feb 10, 2026",
        size: "1.2 MB",
    },
    {
        title: "Booking Confirmation",
        type: "confirmation",
        date: "Feb 5, 2026",
        size: "98 KB",
    },
];

export const allExplorePackages = [
    ...mockTrips.map((trip) => ({
        id: `trip-${trip.id}`,
        destination: trip.destination,
        packageName: trip.packageName,
        image: trip.image,
        priceRange: `$${trip.price}`,
        duration: "N/A",
        rating: 4.5,
        reviewCount: 0,
        agentName: "Booked Trip",
        startPlace: "N/A",
        endPlace: trip.destination.split(",")[0],
        itinerary: trip.itinerary || [
            { day: 1, title: "Trip Activity", description: "Activity details for your booked trip.", activities: ["Booked Activity"] }
        ],
        images: [trip.image],
        category: trip.category || "all",
        reviews: trip.itinerary ? [] : [],
        trending: false,
    })),
    ...mockRecommendations.map((r) => ({
        ...r,
        trending: r.rating >= 4.5,
    })),
    ...additionalPackages.map(p => ({
        ...p,
        trending: p.trending || false
    })),
];

export const mockStats = {
    ongoingTrips: 2,
    completedTrips: 3,
    upcomingBookings: 0,
    totalTrips: 5,
};

export const userName = "Harith Keshan";

// RoomType interface removed

// Hotel interface removed

const commonRoomTypes = [
    {
        id: "rt1",
        name: "Deluxe King Room",
        price: 180,
        description: "Spacious integrated living area with city or ocean views.",
        amenities: ["King Size Bed", "Free Wi-Fi", "Air Conditioning", "Mini Bar"],
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop",
    },
    {
        id: "rt2",
        name: "Luxury Suite",
        price: 350,
        description: "Expansive suite with separate living room and premium amenities.",
        amenities: ["King Size Bed", "Jacuzzi", "Ocean View", "Private Balcony"],
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
    },
];

const commonReviews = [
    {
        id: "rv1",
        userName: "Alice Freeman",
        rating: 5,
        date: "2026-02-10",
        comment: "Absolutely stunning property! The staff went above and beyond.",
        images: ["https://loremflickr.com/400/300/hotel,lobby", "https://loremflickr.com/400/300/hotel,pool"]
    },
    {
        id: "rv2",
        userName: "Mark Taylor",
        rating: 4,
        date: "2026-02-05",
        comment: "Great location and beautiful rooms. Breakfast could be better.",
        images: ["https://loremflickr.com/400/300/hotel,room"]
    },
    {
        id: "rv3",
        userName: "Sana Ahmed",
        rating: 5,
        date: "2026-01-20",
        comment: "Loved the view and the service. Highly recommended!",
        images: ["https://loremflickr.com/400/300/hotel,view"]
    },
];

export const mockHotels = [
    {
        id: "h1",
        destination: "Colombo",
        packageName: "Colombo Grand Hotel",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
        rating: 4.0,
        reviewCount: 120,
        priceRange: "$150 - $450",
        description: "Experience the epitome of luxury at Colombo Grand Hotel, located in the heart of the city. Enjoy breathtaking views of the Indian Ocean and unrivaled hospitality.",
        location: "Galle Face Centre Road, Colombo",
        amenities: ["Infinity Pool", "Spa & Wellness", "Rooftop Bar", "Fitness Center"],
        roomTypes: commonRoomTypes,
        reviews: [
            ...commonReviews,
            {
                id: "h3-r1",
                userName: "Maya Fernandez",
                userAvatar: "https://i.pravatar.cc/150?u=maya",
                rating: 5,
                title: "Stunning beachfront",
                comment: "The sunrise from the balcony was unforgettable. Rooms were spotless and staff were incredibly helpful.",
                date: "2026-02-12",
                images: [
                    "https://loremflickr.com/400/300/galle,beach",
                    "https://loremflickr.com/400/300/galle,fort"
                ]
            },
            {
                id: "h3-r2",
                userName: "Omar Rahman",
                userAvatar: "https://i.pravatar.cc/150?u=omar",
                rating: 4,
                title: "Great location",
                comment: "Perfect spot near Galle Fort and plenty of dining options. Pool area was lovely.",
                date: "2026-01-30",
                images: ["https://loremflickr.com/400/300/galle,pool"]
            }
        ],
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop"
        ]
    },
    {
        id: "h2",
        destination: "Kandy",
        packageName: "Kandy Hill Resort",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
        rating: 4.0,
        reviewCount: 85,
        priceRange: "$100 - $300",
        description: "Nestled in the lush hills of Kandy, this resort offers a tranquil escape with panoramic views of the Mahaweli River and surrounding mountains.",
        location: "Heerassagala Road, Kandy",
        amenities: ["Hillside Pool", "Ayurvedic Spa", "Nature Trails", "Restaurant"],
        roomTypes: commonRoomTypes,
        reviews: [
            ...commonReviews,
            {
                id: "h1-r1",
                userName: "Priya Nadar",
                userAvatar: "https://i.pravatar.cc/150?u=priya",
                rating: 5,
                title: "Exceptional stay",
                comment: "Loved the rooftop bar and the staff made our anniversary feel special.",
                date: "2026-02-02",
                images: ["https://loremflickr.com/400/300/colombo,rooftop", "https://loremflickr.com/400/300/colombo,view"]
            }
        ],
        images: [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"
        ]
    },
    {
        id: "h3",
        destination: "Galle",
        packageName: "Galle Beach Hotel",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
        rating: 5.0,
        reviewCount: 200,
        priceRange: "$200 - $500",
        description: "A beachfront paradise offering direct access to the golden sands of Galle. Perfect for sun seekers and history buffs alike, being close to Galle Fort.",
        location: "Galle Road, Unawatuna",
        amenities: ["Private Beach", "Seafood Restaurant", "Water Sports", "Pool"],
        roomTypes: commonRoomTypes,
        reviews: [
            ...commonReviews,
            {
                id: "h5-r1",
                userName: "Lina Gomez",
                userAvatar: "https://i.pravatar.cc/150?u=lina",
                rating: 5,
                title: "Magical mornings",
                comment: "Woke up to misty tea fields and had the best high tea at their lounge.",
                date: "2026-01-18",
                images: ["https://loremflickr.com/400/300/nuwaraeliya,tea", "https://loremflickr.com/400/300/nuwaraeliya,garden"]
            }
        ],
        images: [
            "https://images.unsplash.com/photo-1520260497591-112f2f40a3f4?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop"
        ]
    },
    {
        id: "h4",
        destination: "Jaffna",
        packageName: "Jaffna Heritage Inn",
        image: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800&auto=format&fit=crop",
        rating: 3.0,
        reviewCount: 45,
        priceRange: "$50 - $150",
        description: "Discover the vibrant culture of the North at Jaffna Heritage Inn. A cozy local stay with authentic cuisine and warm hospitality.",
        location: "Hospital Road, Jaffna",
        amenities: ["Authentic Dining", "Cultural Tours", "Garden", "Wi-Fi"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: [
            "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800&auto=format&fit=crop"
        ]
    },
    {
        id: "h5",
        destination: "Nuwara Eliya",
        packageName: "Nuwara Eliya Tea Resort",
        image: "https://loremflickr.com/800/600/nuwaraeliya,tea,resort",
        rating: 5.0,
        reviewCount: 150,
        priceRange: "$180 - $400",
        description: "Stay amidst rolling tea plantations in 'Little England'. Enjoy high tea, colonial architecture, and cool mountain air.",
        location: "Upper Lake Road, Nuwara Eliya",
        amenities: ["Heated Pool", "Tea Lounge", "Fireplace", "Golf Access"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: [
            "https://loremflickr.com/800/600/nuwaraeliya,tea,resort"
        ]
    },
    {
        id: "h6",
        destination: "Colombo",
        packageName: "Colombo City Luxury Suites",
        image: "https://loremflickr.com/800/600/colombo,luxury,suite",
        rating: 4.7,
        reviewCount: 260,
        priceRange: "$200 - $400",
        description: "Modern luxury suites designed for the business and leisure traveler. Located in the commercial hub with easy access to shopping and dining.",
        location: "Union Place, Colombo",
        amenities: ["Business Center", "Gym", "Concierge", "Fine Dining"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/colombo,luxury,suite"]
    },
    {
        id: "h7",
        destination: "Kandy",
        packageName: "Kandy Lake View Hotel",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop",
        rating: 4.6,
        reviewCount: 190,
        priceRange: "$120 - $250",
        description: "Overlooking the majestic Kandy Lake and Temple of the Tooth. A perfect base for exploring the cultural capital.",
        location: "Sangaraja Mawatha, Kandy",
        amenities: ["Lake View Terrace", "Cultural Shows", "Pool", "Restaurant"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop"]
    },
    {
        id: "h8",
        destination: "Galle",
        packageName: "Galle Fort Boutique Stay",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
        rating: 4.8,
        reviewCount: 310,
        priceRange: "$250 - $450",
        description: "A charming boutique hotel inside the historic Galle Fort. Experience colonial charm with modern comforts.",
        location: "Church Street, Galle Fort",
        amenities: ["Heritage Architecture", "Courtyard", "Library", "Cafe"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop"]
    },
    {
        id: "h9",
        destination: "Jaffna",
        packageName: "Jaffna City Comfort Hotel",
        image: "https://loremflickr.com/800/600/jaffna,hotel,comfort",
        rating: 4.2,
        reviewCount: 105,
        priceRange: "$70 - $180",
        description: "Comfortable and convenient accommodation in the heart of Jaffna city. Close to Nallur Temple and Jaffna Library.",
        location: "Main Street, Jaffna",
        amenities: ["AC Rooms", "Roof Terrace", "Restaurant", "Parking"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/jaffna,hotel,comfort"]
    },
    {
        id: "h10",
        destination: "Nuwara Eliya",
        packageName: "Nuwara Eliya Misty Hills Resort",
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop",
        rating: 4.9,
        reviewCount: 275,
        priceRange: "$200 - $500",
        description: "A secluded resort enveloped in mist and greenery. The ultimate retreat for relaxation and nature lovers.",
        location: "Moon Plains, Nuwara Eliya",
        amenities: ["Nature Walks", "Organic Garden", "Spa", "Fireplace"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop"]
    },
    {
        id: "h11",
        destination: "Matara",
        packageName: "Matara Coastal Beach Resort",
        image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&auto=format&fit=crop",
        rating: 4.4,
        reviewCount: 140,
        priceRange: "$100 - $250",
        description: "Relax on the untouched beaches of Matara. A peaceful getaway with great surfing and whale watching nearby.",
        location: "Polhena Beach Road, Matara",
        amenities: ["Beachfront", "Surfing", "Seafood BBQ", "Pool"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&auto=format&fit=crop"]
    },
    {
        id: "h12",
        destination: "Matara",
        packageName: "Matara Sunset Bay Hotel",
        image: "https://loremflickr.com/800/600/matara,beach,sunset",
        rating: 4.5,
        reviewCount: 180,
        priceRange: "$120 - $280",
        description: "Witness spectacular sunsets from your balcony. Offers comfortable rooms and easy access to Mirissa and Matara town.",
        location: "Beach Road, Matara",
        amenities: ["Sunset View", "Pool", "Bar", "Wi-Fi"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/matara,beach,sunset"]
    },
    {
        id: "h13",
        destination: "Trincomalee",
        packageName: "Trincomalee Ocean Paradise Hotel",
        image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop",
        rating: 4.7,
        reviewCount: 210,
        priceRange: "$150 - $350",
        description: "Located on the pristine Nilaveli beach. Crystal clear waters and white sandy beaches await you.",
        location: "Nilaveli, Trincomalee",
        amenities: ["Diving Center", "Beach Bar", "Pool", "Spa"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop"]
    },
    {
        id: "h14",
        destination: "Trincomalee",
        packageName: "Trincomalee Bay View Resort",
        image: "https://loremflickr.com/800/600/trincomalee,bay,view",
        rating: 4.8,
        reviewCount: 300,
        priceRange: "$180 - $400",
        description: "Overlooking the magnificent Trincomalee harbor. A luxury resort offering water sports and relaxation.",
        location: "Uppuveli, Trincomalee",
        amenities: ["Harbor View", "Water Sports", "Fine Dining", "Gym"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/trincomalee,bay,view"]
    },
    {
        id: "h15",
        destination: "Anuradhapura",
        packageName: "Anuradhapura Heritage Resort",
        image: "https://loremflickr.com/800/600/anuradhapura,heritage,resort",
        rating: 4.5,
        reviewCount: 150,
        priceRange: "$100 - $220",
        description: "Experience the grandeur of the ancient kingdom. Located close to the sacred city and archaeological sites.",
        location: "Old Town, Anuradhapura",
        amenities: ["Garden", "Bike Rental", "Pool", "Restaurant"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/anuradhapura,heritage,resort"]
    },
    {
        id: "h16",
        destination: "Anuradhapura",
        packageName: "Anuradhapura Ancient City Hotel",
        image: "https://loremflickr.com/800/600/anuradhapura,ancient,hotel",
        rating: 4.6,
        reviewCount: 205,
        priceRange: "$120 - $240",
        description: "A modern hotel offering a comfortable base for your pilgrimage or historical tour.",
        location: "New Town, Anuradhapura",
        amenities: ["AC Rooms", "Buffet Restaurant", "Pool", "Wi-Fi"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/anuradhapura,ancient,hotel"]
    },
    {
        id: "h17",
        destination: "Badulla",
        packageName: "Badulla Green Valley Resort",
        image: "https://loremflickr.com/800/600/badulla,green,valley",
        rating: 4.7,
        reviewCount: 180,
        priceRange: "$90 - $200",
        description: "Surrounded by tea gardens and waterfalls. A peaceful retreat in the hill country.",
        location: "Passara Road, Badulla",
        amenities: ["Nature Views", "Hiking Trails", "Restaurant", "Garden"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/badulla,green,valley"]
    },
    {
        id: "h18",
        destination: "Badulla",
        packageName: "Badulla Mountain Breeze Hotel",
        image: "https://loremflickr.com/800/600/badulla,mountain,breeze",
        rating: 4.8,
        reviewCount: 220,
        priceRange: "$100 - $220",
        description: "Enjoy the cool mountain breeze and stunning vistas. Perfectly located for visiting Dunhinda Falls.",
        location: "Ella Road, Badulla",
        amenities: ["Mountain View", "Bar", "Restaurant", "Parking"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/badulla,mountain,breeze"]
    },
    {
        id: "h19",
        destination: "Hambantota",
        packageName: "Hambantota Safari Beach Resort",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop",
        rating: 4.6,
        reviewCount: 190,
        priceRange: "$150 - $350",
        description: "The gateway to Yala and Bundala National Parks. Enjoy luxury camping or beach stays.",
        location: "Safari Road, Hambantota",
        amenities: ["Safari Tours", "Beach Access", "Pool", "Spa"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop"]
    },
    {
        id: "h20",
        destination: "Hambantota",
        packageName: "Hambantota Coastal Luxury Hotel",
        image: "https://loremflickr.com/800/600/hambantota,luxury,resort",
        rating: 4.9,
        reviewCount: 320,
        priceRange: "$200 - $500",
        description: "A world-class resort offering the finest amenities and activities. Golf, spa, and dining at its best.",
        location: "Resort Drive, Hambantota",
        amenities: ["Golf Course", "Convention Center", "Multiple Pools", "Fine Dining"],
        roomTypes: commonRoomTypes,
        reviews: commonReviews,
        images: ["https://loremflickr.com/800/600/hambantota,luxury,resort"]
    }
];
