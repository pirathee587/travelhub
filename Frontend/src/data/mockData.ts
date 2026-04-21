import { Trip } from "@/components/dashboard/TripCard";
import { Recommendation, Review } from "@/components/dashboard/RecommendationCard";

export const mockTrips: Trip[] = [
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


export const mockRecommendations: Recommendation[] = [
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
        images: ["https://loremflickr.com/400/300/sigiriya,view","https://loremflickr.com/400/300/sigiriya,ruins"]
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
        images: ["https://loremflickr.com/400/300/dambulla,cave","https://loremflickr.com/400/300/sigiriya,landscape"]
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
        images: ["https://loremflickr.com/400/300/ella,train","https://loremflickr.com/400/300/ella,ninearch"]
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

export const additionalPackages: Recommendation[] = [
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
]; export const mockDocuments = [
  {
    title: "Bali Trip Invoice",
    type: "invoice" as const,
    date: "Feb 5, 2026",
    size: "245 KB",
  },
  {
    title: "Payment Receipt #45892",
    type: "receipt" as const,
    date: "Feb 5, 2026",
    size: "128 KB",
  },
  {
    title: "Travel Itinerary - Bali",
    type: "itinerary" as const,
    date: "Feb 10, 2026",
    size: "1.2 MB",
  },
  {
    title: "Booking Confirmation",
    type: "confirmation" as const,
    date: "Feb 5, 2026",
    size: "98 KB",
  },
];



export const allExplorePackages: Recommendation[] = [
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
    reviews: trip.itinerary ? [] : [], // Placeholder or map reviews if added to Trip type
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

export interface RoomType {
  id: string;
  name: string;
  price: number;
  description: string;
  amenities: string[];
  image: string;
}

export interface Hotel extends Recommendation {
  description: string;
  location: string;
  roomTypes: RoomType[];
  reviews: Review[];
  amenities: string[];
}

const commonRoomTypes: RoomType[] = [
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

const commonReviews: Review[] = [
  {
    id: "rv1",
    userName: "Alice Freeman",
    rating: 5,
    date: "2026-02-10",
    comment: "Absolutely stunning property! The staff went above and beyond.",
    images: ["https://loremflickr.com/400/300/hotel,lobby","https://loremflickr.com/400/300/hotel,pool"]
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

export const mockHotels: Hotel[] = [
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
        images: ["https://loremflickr.com/400/300/colombo,rooftop","https://loremflickr.com/400/300/colombo,view"]
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
  // Replaced image with an alternative Unsplash image that reliably loads
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
        images: ["https://loremflickr.com/400/300/nuwaraeliya,tea","https://loremflickr.com/400/300/nuwaraeliya,garden"]
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
