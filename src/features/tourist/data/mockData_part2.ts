
export const additionalPackages = [
    {
        id: "p1",
        destination: "Arugam Bay, Ampara District",
        packageName: "Surfing Paradise",
        image: "https://loremflickr.com/800/600/arugambay,surf",
        priceRange: "$250 - $600",
        duration: "5 Days",
        rating: 4.8,
        reviewCount: 450,
        agentName: "East Coast Vibes",
        startPlace: "Colombo",
        endPlace: "Arugam Bay",
        itinerary: [
            { day: 1, title: "Waves & Arrival", description: "Arrive in Arugam Bay and settle into your beach stay. Afternoon surfing evaluation.", activities: ["Arrival", "Surfing Evaluation"] },
            { day: 2, title: "Point Break Mornings", description: "Early morning surfing session followed by a lagoon safari to spot wildlife.", activities: ["Surfing Lessons", "Lagoon Safari"] },
            { day: 3, title: "Sunrise Surf & Beach Vibe", description: "Experience the best waves at sunrise. Evening beach party with local music.", activities: ["Sunrise Surf", "Beach Party"] },
            { day: 4, title: "Coastal Exploration", description: "Explore nearby bays and enjoy a relaxed day of surfing and sunbathing.", activities: ["Coastal Tour", "Surfing"] },
            { day: 5, title: "Farewell Surf", description: "Final morning session before your departure journey.", activities: ["Morning Surf"] }
        ],
        images: [
            "https://loremflickr.com/800/600/arugambay,beach",
            "https://loremflickr.com/800/600/arugambay,sea",
            "https://loremflickr.com/800/600/arugambay,surf"
        ],
        category: "beach",
        trending: true,
        reviews: [
            {
                id: "rev5",
                userName: "Chris Evans",
                userAvatar: "https://i.pravatar.cc/150?u=chris",
                rating: 4,
                title: "Perfect waves",
                comment: "Arugam Bay is a surfer's paradise. The vibe is laid back and the water is perfect. Definitely returning next year.",
                date: "Feb 15, 2026"
            },
            {
                id: "rev-p1-2",
                userName: "Ethan Moore",
                userAvatar: "https://i.pravatar.cc/150?u=ethan",
                rating: 5,
                title: "Surfers dream",
                comment: "The beach parties are great and the surfing lessons were top notch. It's a bit far from Colombo but totally worth the trip.",
                date: "Feb 5, 2026"
            },
            {
                id: "rev-p1-3",
                userName: "Isabella Taylor",
                userAvatar: "https://i.pravatar.cc/150?u=isabella",
                rating: 5,
                title: "Vibrant atmosphere",
                comment: "I loved the lagoon safari, saw some crocodiles! The food at the local cafes is amazing and very cheap.",
                date: "Oct 2, 2024"
            }
        ]
    },
    {
        id: "p2",
        destination: "Trincomalee, Trincomalee District",
        packageName: "East Coast Pristine Beaches",
        image: "https://loremflickr.com/800/600/trincomalee,beach",
        priceRange: "$300 - $700",
        duration: "4 Days",
        rating: 4.7,
        reviewCount: 320,
        agentName: "Trinco Tours",
        startPlace: "Trincomalee",
        endPlace: "Nilaveli",
        itinerary: [
            { day: 1, title: "Trinco Arrival", description: "Transfer to Trincomalee and visit the historic Koneswaram Temple overlooking the bay.", activities: ["Transfer", "Koneswaram Temple"] },
            { day: 2, title: "Pigeon Island Discovery", description: "Half-day snorkeling excursion at Pigeon Island National Park. See turtles and sharks.", activities: ["Pigeon Island Snorkeling"] },
            { day: 3, title: "Marble Beach Luxury", description: "Spend a relaxing day at the pristine Marble Beach with its calm, clear waters.", activities: ["Marble Beach Day"] },
            { day: 4, title: "Harbor & History", description: "Explore Fort Frederick and the harbor area before departure.", activities: ["Fort Frederick", "Departure"] }
        ],
        images: [
            "https://loremflickr.com/800/600/trincomalee,sea",
            "https://loremflickr.com/800/600/trincomalee,nature",
            "https://loremflickr.com/800/600/trincomalee,sand"
        ],
        category: "beach",
        trending: false,
        driverRating: 4.7,
        reviews: [
            {
                id: "rev9",
                userName: "Liam Johnson",
                userAvatar: "https://i.pravatar.cc/150?u=liam",
                rating: 5,
                title: "Clear Blue Waters",
                comment: "Nilaveli beach has the most beautiful sand and clear water. Pigeon Island was perfect for snorkeling.",
                date: "Feb 10, 2026",
                images: ["https://loremflickr.com/400/300/trincomalee,beach,clear"]
            },
            {
                id: "rev-p2-2",
                userName: "Sophia Garcia",
                userAvatar: "https://i.pravatar.cc/150?u=sophia",
                rating: 4,
                title: "Serene Beaches",
                comment: "Koneswaram Temple has amazing views of the ocean. The town is very quiet compared to the south, which I loved.",
                date: "Feb 15, 2026"
            },
            {
                id: "rev-p2-3",
                userName: "Oliver Brown",
                userAvatar: "https://i.pravatar.cc/150?u=oliver",
                rating: 5,
                title: "Pigeon Island is a must",
                comment: "Snorkeling at Pigeon Island was the highlight. We saw turtles and small sharks! Definitely recommend a boat trip.",
                date: "Nov 5, 2024"
            }
        ]
    },
    {
        id: "p3",
        destination: "Polonnaruwa, Polonnaruwa District",
        packageName: "Ancient Kingdom Ruins",
        image: "https://loremflickr.com/800/600/polonnaruwa,ruins",
        priceRange: "$150 - $350",
        duration: "2 Days",
        rating: 4.8,
        reviewCount: 560,
        agentName: "Heritage Walks",
        startPlace: "Dambulla",
        endPlace: "Polonnaruwa",
        itinerary: [
            { day: 1, title: "Kingdom Ruins on Wheels", description: "Cycling tour through the ancient city ruins of Polonnaruwa. Visit the Quadrangle.", activities: ["Cycling Tour", "Ancient Ruins"] },
            { day: 2, title: "Gal Vihara & Giant Tank", description: "Visit the stunning Gal Vihara rock statues and the massive Parakrama Samudra tank.", activities: ["Gal Vihara", "Parakrama Samudra"] }
        ],
        images: [
            "https://loremflickr.com/800/600/polonnaruwa,ancient",
            "https://loremflickr.com/800/600/polonnaruwa,stone",
            "https://loremflickr.com/800/600/polonnaruwa,temple"
        ],
        category: "culture",
        trending: true,
        driverRating: 4.8,
        reviews: [
            {
                id: "rev10",
                userName: "Noah Miller",
                userAvatar: "https://i.pravatar.cc/150?u=noah",
                rating: 4,
                title: "Historical Masterpiece",
                comment: "The ruins are well-preserved. Cycling around the ancient city was a great way to see everything.",
                date: "Feb 22, 2026"
            },
            {
                id: "rev-p3-2",
                userName: "Emma Thompson",
                userAvatar: "https://i.pravatar.cc/150?u=emma",
                rating: 5,
                title: "Back in time",
                comment: "Gal Vihara is simply stunning. The scale of the statues is hard to grasp until you're standing next to them.",
                date: "Feb 12, 2026"
            },
            {
                id: "rev-p3-3",
                userName: "Lucas Silva",
                userAvatar: "https://i.pravatar.cc/150?u=lucas",
                rating: 5,
                title: "Great cycling trip",
                comment: "Renting a bike is the way to go. The area is flat and you can see all the major sites in one day at your own pace.",
                date: "Dec 3, 2024"
            }
        ]
    },
    {
        id: "p4",
        destination: "Anuradhapura, Anuradhapura District",
        packageName: "Sacred City Pilgrimage",
        image: "https://loremflickr.com/800/600/anuradhapura,stupa",
        priceRange: "$100 - $300",
        duration: "2 Days",
        rating: 4.6,
        reviewCount: 410,
        agentName: "Pilgrim Travels",
        startPlace: "Colombo",
        endPlace: "Anuradhapura",
        itinerary: [
            { day: 1, title: "Sacred Bodhi & Stupa", description: "Visit the Jaya Sri Maha Bodhi and the magnificent Ruwanwelisaya Stupa.", activities: ["Jaya Sri Maha Bodhi", "Ruwanwelisaya"] },
            { day: 2, title: "Rock Carvings & Ponds", description: "Explore the Isurumuniya rock cravings and the twin ponds (Kuttam Pokuna).", activities: ["Isurumuniya", "Kuttam Pokuna"] }
        ],
        images: [
            "https://loremflickr.com/800/600/anuradhapura,ruins",
            "https://loremflickr.com/800/600/anuradhapura,temple",
            "https://loremflickr.com/800/600/anuradhapura,tree"
        ],
        festivalDetails: "Special ceremonies during Poson Poya.",
        category: "culture",
        trending: false,
        reviews: [
            {
                id: "rev11",
                userName: "Mia Wilson",
                userAvatar: "https://i.pravatar.cc/150?u=mia",
                rating: 5,
                title: "Spiritual Experience",
                comment: "Visiting the sacred Bodhi tree was deeply moving. The sheer scale of the stupas is unbelievable.",
                date: "Feb 5, 2026",
                images: ["https://loremflickr.com/400/300/anuradhapura,stupa,white"]
            },
            {
                id: "rev-p4-2",
                userName: "James Wilson",
                userAvatar: "https://i.pravatar.cc/150?u=james",
                rating: 5,
                title: "Ancient Wonder",
                comment: "Ruwanwelisaya is even more impressive at night when it's all lit up. The atmosphere is very peaceful and reverent.",
                date: "Feb 10, 2026"
            },
            {
                id: "rev-p4-3",
                userName: "Yuki Tanaka",
                userAvatar: "https://i.pravatar.cc/150?u=yuki",
                rating: 4,
                title: "Must see cultural site",
                comment: "The stone carvings at Isurumuniya are beautiful. There's so much ground to cover, definitely hire a tuk-tuk for the day.",
                date: "Feb 15, 2026"
            }
        ]
    },
    {
        id: "p5",
        destination: "Horton Plains, Nuwara Eliya District",
        packageName: "World's End Trek",
        image: "https://loremflickr.com/800/600/hortonplains,nature",
        priceRange: "$150 - $400",
        duration: "2 Days",
        rating: 4.9,
        reviewCount: 680,
        agentName: "Highland Trekkers",
        startPlace: "Nuwara Eliya",
        endPlace: "Ohiya",
        itinerary: [
            { day: 1, title: "Climb to the Clouds", description: "Early morning hike to World's End in Horton Plains. Visit Baker's Falls.", activities: ["World's End Hike", "Baker's Falls"] },
            { day: 2, title: "Highland Flora", description: "A gentle walk through the cloud forest to discover endemic plant and bird species.", activities: ["Cloud Forest Walk"] }
        ],
        images: [
            "https://loremflickr.com/800/600/hortonplains,view",
            "https://loremflickr.com/800/600/hortonplains,green",
            "https://loremflickr.com/800/600/hortonplains,mist"
        ],
        category: "mountain",
        trending: true,
        driverRating: 4.9,
        reviews: [
            {
                id: "rev12",
                userName: "Ethan Moore",
                userAvatar: "https://i.pravatar.cc/150?u=ethan",
                rating: 5,
                title: "Literal Edge of the World",
                comment: "The early morning trek to World's End was cold but seeing the drop and the view when the mist cleared was a once-in-a-lifetime moment.",
                date: "Feb 28, 2026",
                images: ["https://loremflickr.com/400/300/hortonplains,worldsend,edge"]
            },
            {
                id: "rev-p5-2",
                userName: "Arjun Patel",
                userAvatar: "https://i.pravatar.cc/150?u=arjun",
                rating: 5,
                title: "Beautiful Highlands",
                comment: "Baker's Falls is stunning. The path is well marked and the rolling plains are unlike anything else in Sri Lanka.",
                date: "Feb 20, 2026"
            },
            {
                id: "rev-p5-3",
                userName: "Grace O'Malley",
                userAvatar: "https://i.pravatar.cc/150?u=grace",
                rating: 4,
                title: "Chilly but worth it",
                comment: "Dress warmly! The wind at World's End can be very biting. The scenery is spectacular and very different from the coast.",
                date: "Feb 5, 2026"
            }
        ]
    },
    {
        id: "p6",
        destination: "Sinharaja, Ratnapura District",
        packageName: "Rainforest Expedition",
        image: "https://loremflickr.com/800/600/sinharaja,rainforest",
        priceRange: "$180 - $400",
        duration: "3 Days",
        rating: 4.7,
        reviewCount: 300,
        agentName: "Eco Lanka",
        startPlace: "Deniyaya",
        endPlace: "Sinharaja",
        itinerary: [
            { day: 1, title: "Rainforest Immersion", description: "Guided trek into the Sinharaja Rainforest to spot endemic birds and trees.", activities: ["Bird Watching", "Jungle Trekking"] },
            { day: 2, title: "Waterfall & Canopy", description: "Hike to a remote waterfall for a refreshing bath and explore the forest canopy.", activities: ["Waterfall Bath", "Nature Walk"] },
            { day: 3, title: "Riverside Discovery", description: "Explore the periphery of the rainforest along the Gin Ganga river.", activities: ["River Walk"] }
        ],
        images: [
            "https://loremflickr.com/800/600/sinharaja,forest",
            "https://loremflickr.com/800/600/sinharaja,bird",
            "https://loremflickr.com/800/600/sinharaja,green"
        ],
        festivalDetails: "Monsoon season offers best biodiversity sightings.",
        category: "tropical",
        trending: false,
        reviews: [
            {
                id: "rev13",
                userName: "Isabella Taylor",
                userAvatar: "https://i.pravatar.cc/150?u=isabella",
                rating: 4,
                title: "Nature in its Purest Form",
                comment: "Wet, leech-y, but absolutely gorgeous. Saw many endemic birds and lizards. Wear proper shoes!",
                date: "Feb 5, 2026"
            }
        ]
    },
    {
        id: "p7",
        destination: "Knuckles Range, Kandy District",
        packageName: "Knuckles Wilderness Trek",
        image: "https://loremflickr.com/800/600/srilanka,highlands,wilderness",
        priceRange: "$200 - $500",
        duration: "3 Days",
        rating: 4.8,
        reviewCount: 156,
        agentName: "Wilderness Trails",
        startPlace: "Kandy",
        endPlace: "Kandy",
        itinerary: [
            { day: 1, title: "Base Camp Arrival", description: "Trek to the base camp through cloud forests and tea estates.", activities: ["Hiking", "Bird Watching"] },
            { day: 2, title: "Peak Ascent", description: "Early morning hike to one of the Five Peaks for stunning views.", activities: ["Peak Climbing", "Photography"] },
            { day: 3, title: "Waterfall Descent", description: "Descend via hidden waterfalls and natural pools for a refresh.", activities: ["Waterfall Bath", "Return Trek"] }
        ],
        category: "mountain",
        trending: false,
    },
    {
        id: "p8",
        destination: "Hanthana, Kandy District",
        packageName: "Hanthana Tea Heritage",
        image: "https://loremflickr.com/800/600/ceylon,tea,heritage",
        priceRange: "$80 - $150",
        duration: "1 Day",
        rating: 4.7,
        reviewCount: 84,
        agentName: "Ceylon Heritage",
        startPlace: "Kandy",
        endPlace: "Kandy",
        itinerary: [
            { day: 1, title: "Tea Museum & Trail", description: "Visit the Tea Museum and hike through the Hanthana mountain range.", activities: ["Museum Visit", "Mountain Hike", "Tea Tasting"] }
        ],
        category: "culture",
        trending: false,
    },
    {
        id: "p9",
        destination: "Galle Fort, Galle District",
        packageName: "Galle Fort Historic Walk",
        image: "https://loremflickr.com/800/600/gallefort,lighthouse",
        priceRange: "$100 - $250",
        duration: "2 Days",
        rating: 4.9,
        reviewCount: 420,
        agentName: "Vintage Galle",
        startPlace: "Galle",
        endPlace: "Galle",
        itinerary: [
            { day: 1, title: "Colonial Charm", description: "Guided walk through the ramparts and historic streets of Galle Fort.", activities: ["Ramparts Walk", "Museum Visit"] },
            { day: 2, title: "Maritime History", description: "Visit the Maritime Museum and Dutch Reformed Church before sunset.", activities: ["Church Visit", "Lighthouse View"] }
        ],
        category: "culture",
        trending: true,
    },
    {
        id: "p10",
        destination: "Unawatuna, Galle District",
        packageName: "Unawatuna Coastal Escape",
        image: "https://loremflickr.com/800/600/unawatuna,beach,sea",
        priceRange: "$150 - $400",
        duration: "3 Days",
        rating: 4.8,
        reviewCount: 290,
        agentName: "Coastal Gems",
        startPlace: "Galle",
        endPlace: "Unawatuna",
        itinerary: [
            { day: 1, title: "Bay Relaxation", description: "Settle into the Unawatuna bay and enjoy a quiet sunset dinner.", activities: ["Beach Relax", "Seafood Dinner"] },
            { day: 2, title: "Coral Reef Snorkeling", description: "Morning boat trip to the Jungle Beach coral reefs for snorkeling.", activities: ["Snorkeling", "Boat Trip"] },
            { day: 3, title: "Japanese Peace Pagoda", description: "Visit the stunning white pagoda overlooking the bay.", activities: ["Pagoda Visit", "Coastal Hike"] }
        ],
        category: "beach",
        trending: false,
    },
    {
        id: "p11",
        destination: "Bundala, Hambantota District",
        packageName: "Bundala Bird Watching Safari",
        image: "https://loremflickr.com/800/600/bundala,birds,flamingo",
        priceRange: "$120 - $300",
        duration: "2 Days",
        rating: 4.6,
        reviewCount: 112,
        agentName: "Birding Sri Lanka",
        startPlace: "Hambantota",
        endPlace: "Bundala",
        itinerary: [
            { day: 1, title: "Lagoon Birding", description: "Afternoon jeep safari focusing on migratory birds around the lagoons.", activities: ["Jeep Safari", "Photography"] },
            { day: 2, title: "Wetland Exploration", description: "Early morning boat safari through the wetlands of Bundala.", activities: ["Boat Safari", "Bird Listing"] }
        ],
        category: "wildlife",
        trending: false,
    },
    {
        id: "p12",
        destination: "Ridiyagama, Hambantota District",
        packageName: "Ridiyagama Safari Experience",
        image: "https://loremflickr.com/800/600/ridiyagama,safari,animals",
        priceRange: "$50 - $120",
        duration: "1 Day",
        rating: 4.5,
        reviewCount: 215,
        agentName: "Island Safaris",
        startPlace: "Hambantota",
        endPlace: "Ridiyagama",
        itinerary: [
            { day: 1, title: "Open-Air Safari", description: "Drive through the 500-acre safari park and see lions, tigers, and more.", activities: ["Open Safari", "Animal Feed Viewing"] }
        ],
        category: "wildlife",
        trending: false,
    },
    {
        id: "p13",
        destination: "Delft Island, Jaffna District",
        packageName: "Delft Island Adventure",
        image: "https://loremflickr.com/800/600/island,wildponies,ferry",
        priceRange: "$70 - $180",
        duration: "1 Day",
        rating: 4.7,
        reviewCount: 95,
        agentName: "Northern Trails",
        startPlace: "Jaffna",
        endPlace: "Jaffna",
        itinerary: [
            { day: 1, title: "Wild Horses & Corals", description: "Take the ferry to Delft and explore the Dutch fort and wild ponies.", activities: ["Ferry Ride", "Pony Spotting", "Coral Wall Walk"] }
        ],
        category: "culture",
        trending: false,
    },
    {
        id: "p14",
        destination: "Point Pedro, Jaffna District",
        packageName: "Point Pedro Coastal Tour",
        image: "https://loremflickr.com/800/600/jaffna,northern,coast",
        priceRange: "$120 - $300",
        duration: "2 Days",
        rating: 4.5,
        reviewCount: 64,
        agentName: "Jaffna Voyages",
        startPlace: "Jaffna",
        endPlace: "Point Pedro",
        itinerary: [
            { day: 1, title: "The Northernmost Tip", description: "Visit the Sakkotai Cape and the historic Point Pedro lighthouse.", activities: ["Cape Visit", "Dune Exploration"] },
            { day: 2, title: "Manalkadu Dunes", description: "Explore the vast sand dunes and the buried church of Manalkadu.", activities: ["Dune Walk", "Church Ruins"] }
        ],
        category: "culture",
        trending: false,
    },
    {
        id: "p15",
        destination: "Dambulla, Matale District",
        packageName: "Dambulla Cave & Spice Path",
        image: "https://loremflickr.com/800/600/goldentemple,buddhist,cave",
        priceRange: "$100 - $250",
        duration: "2 Days",
        rating: 4.8,
        reviewCount: 310,
        agentName: "Spice Routes",
        startPlace: "Matale",
        endPlace: "Dambulla",
        itinerary: [
            { day: 1, title: "Golden Temple", description: "Explore the ancient cave temples of Dambulla and the Golden Buddha.", activities: ["Cave Temple Tour", "Photography"] },
            { day: 2, title: "Spice Gardens", description: "Guided walk through the spice and herbal gardens of Matale.", activities: ["Spice Garden Tour", "Herbal Tasting"] }
        ],
        category: "culture",
        trending: true,
    },
    {
        id: "p16",
        destination: "Riverston, Matale District",
        packageName: "Riverston Peak Exploration",
        image: "https://loremflickr.com/800/600/grassland,cloudy,summit",
        priceRange: "$150 - $350",
        duration: "2 Days",
        rating: 4.9,
        reviewCount: 128,
        agentName: "Peak Explorers",
        startPlace: "Matale",
        endPlace: "Riverston",
        itinerary: [
            { day: 1, title: "Pitawala Pathana", description: "Hike across the unique grasslands and visit the 'Mini World's End'.", activities: ["Grassland Hike", "Viewpoint Trek"] },
            { day: 2, title: "Sera Ella Waterfalls", description: "Trek to the hidden Sera Ella waterfalls and explore the cave behind it.", activities: ["Waterfall Trek", "Cave Exploration"] }
        ],
        category: "mountain",
        trending: false,
    }
];
