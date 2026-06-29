
// Types removed

export const mockTrips = [
    {
        id: "1",
        destination: "Kandy, Kandy District",
        packageName: "Kandy Perahera Tour",
        startDate: "Jan 15, 2025",
        endDate: "Jan 22, 2025",
        status: "in_progress",
        progress: 45,
        image: "https://loremflickr.com/800/600/kandy,perahera",
        price: 1200,
        category: "city",
    },
    {
        id: "2",
        destination: "Bentota, Galle District",
        packageName: "Bentota Beach Retreat",
        startDate: "Feb 10, 2025",
        endDate: "Feb 17, 2025",
        status: "confirmed",
        image: "https://loremflickr.com/800/600/bentota,beach",
        price: 1500,
        category: "beach",
    },
    {
        id: "3",
        destination: "Sigiriya, Matale District",
        packageName: "Sigiriya Cultural Tour",
        startDate: "Dec 1, 2024",
        endDate: "Dec 5, 2024",
        status: "completed",
        image: "https://loremflickr.com/800/600/sigiriya,lionrock",
        price: 900,
        hotelName: "Sigiriya Heritage Hotel",
        category: "culture",
    },
    {
        id: "4",
        destination: "Yala, Hambantota District",
        packageName: "Yala Safari Camp",
        startDate: "Nov 15, 2024",
        endDate: "Nov 18, 2024",
        status: "completed",
        image: "https://loremflickr.com/800/600/yala,safari",
        price: 1100,
        hotelName: "Yala Safari Lodge",
        category: "wildlife",
    },
    {
        id: "5",
        destination: "Jaffna, Jaffna District",
        packageName: "Jaffna Heritage Visit",
        startDate: "Oct 5, 2024",
        endDate: "Oct 10, 2024",
        status: "completed",
        image: "https://loremflickr.com/800/600/jaffna,srilanka",
        price: 850,
        hotelName: "Jaffna Heritage Inn",
        category: "culture",
    },
];


export const mockRecommendations = [
    {
        id: "r1",
        destination: "Sigiriya, Matale District",
        packageName: "Ancient Lion Rock Fortress & Dambulla Gold",
        image: "https://loremflickr.com/800/600/sigiriya,rock",
        priceRange: "$200 - $550",
        duration: "3 Days",
        rating: 4.9,
        reviewCount: 1250,
        agentName: "Cultural Heritage Lanka",
        startPlace: "Colombo",
        endPlace: "Sigiriya",
        itinerary: [
            { day: 1, title: "Dambulla Cave Temples", description: "Visit the UNESCO world heritage Dambulla Cave Temple complex on the way to Sigiriya.", activities: ["Dambulla Cave Tour", "Sigiriya Transfer"] },
            { day: 2, title: "Sigiriya Rock Fortress", description: "Early morning climb of the Lion Rock. Afternoon Minneriya Elephant Safari.", activities: ["Lion Rock Climb", "Elephant Safari"] },
            { day: 3, title: "Hiriwadunna Village Life", description: "Traditional village experience including a bullock cart ride and a home-cooked lunch.", activities: ["Village Safari", "Bullock Cart Ride"] }
        ],
        images: [
            "https://loremflickr.com/800/600/sigiriya,nature",
            "https://loremflickr.com/800/600/sigiriya,ruins",
            "https://loremflickr.com/800/600/sigiriya,view"
        ],
        festivalDetails: "Special illumination events during Vesak and Poson Poya.",
        category: "culture",
        trending: true,
        driverRating: 4.8,
        reviews: [
            {
                id: "rev-r1-1",
                userName: "James Wilson",
                userAvatar: "https://i.pravatar.cc/150?u=james",
                rating: 5,
                title: "Iconic Experience",
                comment: "The scale of Sigiriya is incredible. Dambulla caves were also a highlight for me.",
                date: "Feb 12, 2026"
                ,
                images: ["https://loremflickr.com/400/300/sigiriya,view", "https://loremflickr.com/400/300/sigiriya,ruins"]
            },
            {
                id: "rev-r1-2",
                userName: "Yuki Tanaka",
                userAvatar: "https://i.pravatar.cc/150?u=yuki",
                rating: 5,
                title: "Stunning history",
                comment: "The frescoes and the mirror wall are incredible. Our guide explained the history so well. Highly recommend the village safari too!",
                date: "Feb 15, 2026"
                ,
                images: ["https://loremflickr.com/400/300/dambulla,cave", "https://loremflickr.com/400/300/sigiriya,landscape"]
            },
            {
                id: "rev-r1-3",
                userName: "Grace O'Malley",
                userAvatar: "https://i.pravatar.cc/150?u=grace",
                rating: 5,
                title: "Perfect Sunrise",
                comment: "Sigiriya is magical. The village lunch was some of the best food I've had in Sri Lanka.",
                date: "Feb 20, 2026"
                ,
                images: ["https://loremflickr.com/400/300/sigiriya,sunrise"]
            }
        ]
    },
    {
        id: "r2",
        destination: "Ella, Badulla District",
        packageName: "Scenic Hill Country Train",
        image: "https://loremflickr.com/800/600/ella,train,bridge",
        priceRange: "$200 - $500",
        duration: "3 Days",
        rating: 4.9,
        reviewCount: 980,
        agentName: "Ceylon Scenic Rails",
        startPlace: "Kandy",
        endPlace: "Ella",
        itinerary: [
            { day: 1, title: "Kandy to Ella Train Journey", description: "Take the world-famous scenic train ride from Kandy to Ella through lush tea plantations.", activities: ["Train Ride", "Scenic Views"] },
            { day: 2, title: "Ella Peaks & Architecture", description: "Visit the iconic Nine Arches Bridge and hike up Little Adam's Peak for sunset.", activities: ["Nine Arches Bridge", "Little Adam's Peak"] },
            { day: 3, title: "Tea Heritage", description: "Visit a local tea factory to learn about the production process and enjoy a tasting.", activities: ["Tea Factory Visit", "Tea Tasting"] }
        ],
        images: [
            "https://loremflickr.com/800/600/ella,train",
            "https://loremflickr.com/800/600/ella,ninearch",
            "https://loremflickr.com/800/600/ella,tea"
        ],
        category: "mountain",
        trending: true,
        driverRating: 4.9,
        reviews: [
            {
                id: "rev-r2-1",
                userName: "Lucas Silva",
                userAvatar: "https://i.pravatar.cc/150?u=lucas",
                rating: 5,
                title: "Magic in the mountains",
                comment: "The train ride from Kandy to Ella is the most beautiful I've ever taken. Nine Arches Bridge is even better in person.",
                date: "Feb 28, 2026"
                ,
                images: ["https://loremflickr.com/400/300/ella,train", "https://loremflickr.com/400/300/ella,ninearch"]
            },
            {
                id: "rev-r2-2",
                userName: "Emma Thompson",
                userAvatar: "https://i.pravatar.cc/150?u=emma",
                rating: 5,
                title: "Peaceful Ella",
                comment: "Little Adam's Peak was an easy hike with amazing rewards. The tea factory visit was very educational and tasty!",
                date: "Feb 15, 2026"
                ,
                images: ["https://loremflickr.com/400/300/ella,hike"]
            },
            {
                id: "rev-r2-3",
                userName: "Arjun Patel",
                userAvatar: "https://i.pravatar.cc/150?u=arjun",
                rating: 4,
                title: "Great vibes",
                comment: "Ella has such a chilled out vibe. Lots of great cafes and the scenery is just stunning. A bit touristy but worth it.",
                date: "Feb 10, 2026"
            }
        ]
    },
    {
        id: "r3",
        destination: "Mirissa, Matara District",
        packageName: "Whale Watching & Beach",
        image: "https://loremflickr.com/800/600/mirissa,beach,whale",
        priceRange: "$300 - $600",
        duration: "4 Days",
        rating: 4.8,
        reviewCount: 750,
        agentName: "Southern Coast Travels",
        startPlace: "Galle",
        endPlace: "Mirissa",
        itinerary: [
            { day: 1, title: "Southern Shore Arrival", description: "Transfer to Mirissa and spend the afternoon relaxing at the Secret Beach.", activities: ["Transfer", "Secret Beach"] },
            { day: 2, title: "Whale Watching & Sunset", description: "Early morning whale watching excursion followed by a sunset visit to Coconut Tree Hill.", activities: ["Whale Watching", "Coconut Tree Hill"] },
            { day: 3, title: "Mirissa Waves", description: "Enjoy a morning surfing lesson suitable for all levels.", activities: ["Surfing Lessons"] },
            { day: 4, title: "Beach Relaxation", description: "Full day at leisure on Mirissa's main beach before your departure journey.", activities: ["Beach Day"] }
        ],
        images: [
            "https://loremflickr.com/800/600/mirissa,beach",
            "https://loremflickr.com/800/600/mirissa,sea",
            "https://loremflickr.com/800/600/mirissa,palm"
        ],
        category: "beach",
        trending: false,
        driverRating: 4.7,
        reviews: [
            {
                id: "rev6",
                userName: "Oliver Brown",
                userAvatar: "https://i.pravatar.cc/150?u=oliver",
                rating: 5,
                title: "Whale Watching was incredible!",
                comment: "We saw three blue whales! Mirissa is such a beautiful beach town with great food and friendly locals.",
                date: "Feb 18, 2026",
                images: ["https://loremflickr.com/400/300/mirissa,whale,sea"]
            },
            {
                id: "rev-r3-2",
                userName: "Isabella Rossi",
                userAvatar: "https://i.pravatar.cc/150?u=isabella",
                rating: 5,
                title: "Beach bliss",
                comment: "Coconut Tree Hill at sunset is a dream. The water is perfect for swimming and the seafood is so fresh.",
                date: "Feb 5, 2026"
            },
            {
                id: "rev-r3-3",
                userName: "Chen Wei",
                userAvatar: "https://i.pravatar.cc/150?u=chen",
                rating: 4,
                title: "Surfing and Sun",
                comment: "Great spot for beginner surfers. The Secret Beach is a bit of a trek but definitely worth the effort for the privacy.",
                date: "Feb 25, 2026"
            }
        ]
    },
    {
        id: "r4",
        destination: "Yala, Hambantota District",
        packageName: "Wildlife Safari Adventure & Coast",
        image: "https://loremflickr.com/800/600/yala,animals",
        priceRange: "$250 - $650",
        duration: "4 Days",
        rating: 4.8,
        reviewCount: 1540,
        agentName: "Wild Lanka Safaris",
        startPlace: "Colombo",
        endPlace: "Hambantota",
        itinerary: [
            { day: 1, title: "Southern Journey", description: "Drive south to Yala. Afternoon safari at Bundala National Park for bird lovers.", activities: ["Bundala Safari", "Hotel Transfer"] },
            { day: 2, title: "Full Day Yala Safari", description: "Experience the wilderness from dawn to dusk. Lunch inside the park.", activities: ["Full Day Jeep Safari", "Wildlife Photography"] },
            { day: 3, title: "Kirinda Beach & Temple", description: "Visit the historic Kirinda temple and enjoy the rugged coastal beauty.", activities: ["Kirinda Visit", "Beach Relaxation"] },
            { day: 4, title: "Elephant Transit Home", description: "Visit the Udawalawe Elephant Transit Home on your return journey.", activities: ["ETH Visit", "Departure Transfer"] }
        ],
        images: [
            "https://loremflickr.com/800/600/yala,wild",
            "https://loremflickr.com/800/600/yala,camp",
            "https://loremflickr.com/800/600/yala,leopard"
        ],
        festivalDetails: "Best wildlife sightings from February to June.",
        category: "wildlife",
        trending: true,
        driverRating: 4.8,
        reviews: [
            {
                id: "rev-r4-1",
                userName: "Arjun Patel",
                userAvatar: "https://i.pravatar.cc/150?u=arjun",
                rating: 5,
                title: "Leopard Spotted!",
                comment: "We saw two leopards and countless elephants. The safari guides are excellent planners.",
                date: "Feb 20, 2026",
                images: ["https://loremflickr.com/400/300/yala,leopard,zoom"]
            },
            {
                id: "rev-r4-2",
                userName: "Grace O'Malley",
                userAvatar: "https://i.pravatar.cc/150?u=grace",
                rating: 5,
                title: "Wildlife Heaven",
                comment: "Camping under the stars in Yala was an experience I'll never forget. Highly recommend the full day safari.",
                date: "Feb 15, 2026"
            },
            {
                id: "rev-r4-3",
                userName: "Lucas Silva",
                userAvatar: "https://i.pravatar.cc/150?u=lucas",
                rating: 4,
                title: "Dusty but amazing",
                comment: "Bring a scarf for the dust! The safari was long but we saw so much biodiversity.",
                date: "Feb 22, 2026"
            }
        ]
    },
    {
        id: "r5",
        destination: "Kandy, Kandy District",
        packageName: "Kandy Sacred Heritage & Hill Country",
        image: "https://loremflickr.com/800/600/kandy,temple,hills",
        priceRange: "$150 - $450",
        duration: "3 Days",
        rating: 4.7,
        reviewCount: 890,
        agentName: "Hill Country Heritage",
        startPlace: "Colombo",
        endPlace: "Kandy",
        itinerary: [
            { day: 1, title: "Temple of the Sacred Tooth", description: "Visit one of the most sacred places of worship in the Buddhist world. Evening cultural dance performance.", activities: ["Temple of the Tooth", "Cultural Dance Show"] },
            { day: 2, title: "Royal Botanical Gardens", description: "Explore the vast Peradeniya Botanical Gardens, famous for its collection of orchids and giant palm trees.", activities: ["Botanical Garden Tour", "Lunch at Garden"] },
            { day: 3, title: "Hanthana Mountain Trek", description: "A gentle morning trek through the Hanthana mountain range for panoramic views of the city.", activities: ["Morning Trek", "Tea Museum Visit"] }
        ],
        images: [
            "https://loremflickr.com/800/600/kandy,lake",
            "https://loremflickr.com/800/600/kandy,culture",
            "https://loremflickr.com/800/600/kandy,botanical"
        ],
        festivalDetails: "Experience the majestic Esala Perahera during July/August.",
        category: "city",
        trending: true,
        reviews: [
            {
                id: "rev8",
                userName: "Sophia Garcia",
                userAvatar: "https://i.pravatar.cc/150?u=sophia",
                rating: 5,
                title: "Majestic Experience",
                comment: "The Temple of the Tooth is breathtaking. Kandy has a unique, royal atmosphere that I loved.",
                date: "Feb 1, 2026",
                images: ["https://loremflickr.com/400/300/kandy,temple,ceremony"]
            },
            {
                id: "rev-r5-2",
                userName: "Noah Miller",
                userAvatar: "https://i.pravatar.cc/150?u=noah",
                rating: 5,
                title: "Peaceful Retreat",
                comment: "The gardens are massive and very well maintained. The mountain trek offered some of the best views of my trip.",
                date: "Feb 18, 2026"
            }
        ]
    },
];
