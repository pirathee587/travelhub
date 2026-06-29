export const packages = [
  {
    id: 'PKG001',
    name: 'Cultural Triangle Heritage',
    destination: 'Sigiriya & Polonnaruwa',
    duration: '4 Days',
    price: 450,
    priceFrom: 450,
    priceTo: 650,
    description:
      'Explore the ancient cities of Sigiriya and Polonnaruwa, climbing the Lion Rock and visiting ancient ruins.',
    includes: [
      '3-Star Hotel',
      'Entrance Fees',
      'Daily Breakfast',
      'Guide Service',
    ],
    available: true,
    bookings: 42,
    activities: [
      {
        day: 1,
        title: 'Arrival & Transfer',
        description: 'Pick up from airport and transfer to hotel in Sigiriya.',
        image:
          'https://images.unsplash.com/photo-1580720498305-64bcbe355a29?q=80&w=1000&auto=format&fit=crop', // Sigiriya landscape
      },
      {
        day: 2,
        title: 'Sigiriya Rock Fortress',
        description: 'Morning climb of Sigiriya Lion Rock.',
        image:
          'https://images.unsplash.com/photo-1588597576556-91e82e66869b?q=80&w=1000&auto=format&fit=crop', // Sigiriya Rock
      },
    ],

    images: [
      'https://images.unsplash.com/photo-1588597576556-91e82e66869b?q=80&w=1000&auto=format&fit=crop', // Main: Sigiriya
      'https://images.unsplash.com/photo-1578564886629-688df5e8c15a?q=80&w=1000&auto=format&fit=crop', // Polonnaruwa
    ],
  },
  {
    id: 'PKG002',
    name: 'Hill Country Train Adventure',
    destination: 'Ella & Nuwara Eliya',
    duration: '3 Days',
    price: 320,
    priceFrom: 320,
    priceTo: 480,
    description:
      'Take the iconic train ride to Ella, visit tea plantations, and enjoy the cool climate of Nuwara Eliya.',
    includes: [
      'Boutique Hotel',
      'Train Tickets',
      'Tea Factory Visit',
      'Transportation',
    ],
    available: true,
    bookings: 28,
    activities: [
      {
        day: 1,
        title: 'Scenic Train Journey',
        description:
          'Board the famous blue train from Kandy to Ella, passing through lush tea plantations and misty mountains.',
        image:
          'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 2,
        title: 'Ella Rock & Nine Arches',
        description:
          'Hiking Ella Rock for sunrise and visiting the architectural marvel of the Nine Arch Bridge.',
        image:
          'https://images.unsplash.com/photo-1625736300986-77885b5cb118?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 3,
        title: 'Nuwara Eliya Tea Tour',
        description:
          "Visit a historic tea factory and explore 'Little England' before departure.",
        image:
          'https://images.unsplash.com/photo-1546522338-d6984e7ad263?q=80&w=1000&auto=format&fit=crop',
      },
    ],

    images: [
      'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?q=80&w=1000&auto=format&fit=crop', // Nine Arch Bridge
      'https://images.unsplash.com/photo-1546522338-d6984e7ad263?q=80&w=1000&auto=format&fit=crop', // Tea Plantation
      'https://images.unsplash.com/photo-1625736300986-77885b5cb118?q=80&w=1000&auto=format&fit=crop', // Ella Train
    ],
  },
  {
    id: 'PKG003',
    name: 'Southern Coastal Bliss',
    destination: 'Galle & Mirissa',
    duration: '5 Days',
    price: 600,
    priceFrom: 600,
    priceTo: 850,
    description:
      'Relax on the sandy beaches of Mirissa and explore the historic Galle Fort.',
    includes: ['Beach Resort', 'Whale Watching', 'Fort Tour', 'Seafood Dinner'],
    available: true,
    bookings: 35,
    activities: [
      {
        day: 1,
        title: 'Arrival in Galle',
        description:
          'Check into your beach resort and enjoy a sunset walk along the Galle Fort ramparts.',
        image:
          'https://images.unsplash.com/photo-1559869680-e37346dc2f41?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 2,
        title: 'Galle Fort History Tour',
        description:
          'Guided walking tour of the UNESCO World Heritage site, exploring colonial architecture and museums.',
        image:
          'https://images.unsplash.com/photo-1605634645068-1eb6e6761763?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 3,
        title: 'Mirissa Beach Relaxation',
        description:
          'Transfer to Mirissa for a day of sun, sea, and sand on the palm-fringed coast.',
        image:
          'https://images.unsplash.com/photo-1586036737521-72f56715b53e?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 4,
        title: 'Whale Watching Expedition',
        description:
          'Early morning boat tour to spot Blue Whales and Dolphins in their natural habitat.',
        image:
          'https://images.unsplash.com/photo-1568430462989-44163eb1752f?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 5,
        title: 'Departure',
        description: 'Breakfast by the beach and transfer to the airport.',
        image:
          'https://images.unsplash.com/photo-1590442387796-03c7344933a3?q=80&w=1000&auto=format&fit=crop',
      },
    ],

    images: [
      'https://images.unsplash.com/photo-1559869680-e37346dc2f41?q=80&w=1000&auto=format&fit=crop', // Galle Fort
      'https://images.unsplash.com/photo-1586036737521-72f56715b53e?q=80&w=1000&auto=format&fit=crop', // Mirissa
      'https://images.unsplash.com/photo-1568430462989-44163eb1752f?q=80&w=1000&auto=format&fit=crop', // Whales
    ],
  },
  {
    id: 'PKG004',
    name: 'Wild Yala Safari',
    destination: 'Yala, Hambantota',
    duration: '2 Days',
    price: 250,
    priceFrom: 250,
    priceTo: 380,
    description:
      'Spot leopards and elephants on a thrilling jeep safari in Yala National Park.',
    includes: ['Safari Lodge', 'Jeep Safari', 'Park Fees', 'BBQ Dinner'],
    available: true,
    bookings: 22,
    activities: [
      {
        day: 1,
        title: 'Evening Jeep Safari',
        description:
          'Enter Yala National Park in search of the elusive Sri Lankan Leopard and herds of elephants.',
        image:
          'https://images.unsplash.com/photo-1628678683563-71a2a5aee5c3?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 2,
        title: 'Morning Bird Watching',
        description:
          'Early morning nature walk or drive to spot diverse bird species followed by breakfast.',
        image:
          'https://images.unsplash.com/photo-1575825700543-a6d10c141088?q=80&w=1000&auto=format&fit=crop',
      },
    ],

    images: [
      'https://images.unsplash.com/photo-1628678683563-71a2a5aee5c3?q=80&w=1000&auto=format&fit=crop', // Leopard
      'https://images.unsplash.com/photo-1575825700543-a6d10c141088?q=80&w=1000&auto=format&fit=crop', // Elephant
      'https://images.unsplash.com/photo-1534064560731-08e75eb82b88?q=80&w=1000&auto=format&fit=crop', // Safari Jeep
    ],
  },
  {
    id: 'PKG005',
    name: 'Jaffna Tamil Culture',
    destination: 'Jaffna',
    duration: '4 Days',
    price: 400,
    priceFrom: 400,
    priceTo: 560,
    description:
      'Experience the unique culture, food, and history of the northern peninsula.',
    includes: [
      'City Hotel',
      'Nallur Temple',
      'Island Boat Ride',
      'Jaffna Cuisine',
    ],
    available: true,
    bookings: 15,
    activities: [
      {
        day: 1,
        title: 'Journey to the North',
        description:
          'Travel to Jaffna and settle into your hotel. Evening visit to the Jaffna Public Library.',
        image:
          'https://images.unsplash.com/photo-1589405858862-2ac9cbb6d5d5?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 2,
        title: 'Nallur Kandaswamy Kovil',
        description:
          'Witness the spiritual grandeur of the Nallur Kovil puja ceremony.',
        image:
          'https://images.unsplash.com/photo-1622309852206-89680376722f?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 3,
        title: 'Delft Island Adventure',
        description:
          'Boat ride to Delft Island to see wild horses and colonial ruins.',
        image:
          'https://images.unsplash.com/photo-1558299176-b6ae87163820?q=80&w=1000&auto=format&fit=crop',
      },
      {
        day: 4,
        title: 'Jaffna Fort & Market',
        description:
          'Explore the Dutch Fort and shop for local spices and palmyrah products before departure.',
        image:
          'https://images.unsplash.com/photo-1584803794347-c373a4b9c9f6?q=80&w=1000&auto=format&fit=crop',
      },
    ],

    images: [
      'https://images.unsplash.com/photo-1622309852206-89680376722f?q=80&w=1000&auto=format&fit=crop', // Temple
      'https://images.unsplash.com/photo-1589405858862-2ac9cbb6d5d5?q=80&w=1000&auto=format&fit=crop', // Library/Fort
      'https://images.unsplash.com/photo-1558299176-b6ae87163820?q=80&w=1000&auto=format&fit=crop', // Boat/Island
    ],
  },
  {
    id: 'PKG006',
    name: 'Colombo City Tour',
    destination: 'Colombo',
    duration: '1 Day',
    price: 80,
    priceFrom: 80,
    priceTo: 120,
    description:
      'A comprehensive city tour covering colonial architecture, markets, and modern landmarks.',
    includes: ['Private Car', 'Museum Ticket', 'Lunch', 'Shopping Guide'],
    available: true,
    bookings: 50,
    activities: [
      {
        day: 1,
        title: 'City Highlights',
        description:
          'Visit Independence Square, Gangaramaya Temple, and the Pettah Market.',
        image:
          'https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=1000&auto=format&fit=crop',
      },
    ],

    images: [
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop', // Lotus Tower
      'https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=1000&auto=format&fit=crop', // Temple
    ],
  },
];
