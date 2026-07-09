import ella_nine_arch from "@/assets/images/ella_nine_arch.jpg";
import galle_fort from "@/assets/images/galle_fort.jpg";
import mirissa_beach from "@/assets/images/mirissa_beach.jpg";
import kandy_temple from "@/assets/images/kandy_temple.jpg";
import nuwara_eliya from "@/assets/images/nuwara_eliya.jpg";
import sigiriya from "@/assets/images/sigiriya.jpg";
export const mockAgents = [
  {id:1,name:'Pinnacle Tours & Travels',owner:'Mahesh Perera',agencyTagline:'Sri Lanka Travel Experts',email:'info@pinnacletours.lk',phone:'+94 77 123 4567',location:'Colombo, Sri Lanka',memberSince:'March 2020',rating:4.8,avatar:'/images/avatar1.png',vehicles:[{type:'Toyota Hiace',plateNo:'KV-1234',capacity:14,category:'Bus'},{type:'Land Rover Defender',plateNo:'KV-1235',capacity:7,category:'SUV'},{type:'Honda Accord',plateNo:'KV-1236',capacity:5,category:'Sedan'}],drivers:[{name:'Sunil Fernando',license:'B-CAB-5678',phone:'+94 771234567'},{name:'Ravi Kumar',license:'A-98765432',phone:'+94 712345678'},{name:'Chaminda Jayawardena',license:'A-45678901',phone:'+94 723456789'}],status:'Pending',submitted:'15/01/2024',nicPhotocopy:'/images/nic_sample_1.jpg',licensePhotocopy:'/images/license_sample_1.jpg'},
  {id:2,name:'Ceylon Safari Adventures',owner:'Kamal Silva',agencyTagline:'Adventure Travel Specialists',email:'bookings@ceylosafari.com',phone:'+94 71 234 5678',location:'Kandy, Sri Lanka',memberSince:'Jan 2019',rating:4.6,avatar:'/images/avatar2.png',vehicles:[{type:'Land Rover Defender',plateNo:'KV-2345',capacity:7,category:'SUV'},{type:'Toyota Fortuner',plateNo:'KV-2346',capacity:7,category:'SUV'},{type:'Hyundai Tucson',plateNo:'KV-2347',capacity:5,category:'SUV'}],drivers:[{name:'Ranjith Kumar',license:'A-98765432',phone:'+94 712345670'},{name:'Anura Perera',license:'B-34567890',phone:'+94 701234567'}],status:'Approved',submitted:'14/01/2024',nicPhotocopy:'/images/nic_sample_2.jpg',licensePhotocopy:'/images/license_sample_2.jpg'},
  {id:3,name:'Island Hopper Tours',owner:'Gajanthan',agencyTagline:'Coastal & Wildlife Tours',email:'hello@islandhopper.lk',phone:'+94 72 345 6789',location:'Galle, Sri Lanka',memberSince:'June 2021',rating:4.5,avatar:'/images/avatar3.png',vehicles:[{type:'Hyundai Grand i10',plateNo:'WP-5678',capacity:5,category:'Hatchback'},{type:'Kia Picanto',plateNo:'WP-5679',capacity:5,category:'Hatchback'},{type:'BMW 3 Series',plateNo:'WP-5680',capacity:5,category:'Sedan'}],drivers:[{name:'Akbar Hassan',license:'B-45678901',phone:'+94 731234567'},{name:'Dilan Silva',license:'B-56789012',phone:'+94 741234567'}],status:'Pending',submitted:'13/01/2024',nicPhotocopy:'/images/nic_sample_3.jpg',licensePhotocopy:'/images/license_sample_3.jpg'},
  {id:4,name:'Island Hopper Tours',owner:'Suthankan',agencyTagline:'Coastal & Wildlife Tours',email:'hello@islandhopper.lk',phone:'+94 72 345 6790',location:'Galle, Sri Lanka',memberSince:'July 2021',rating:4.4,avatar:'/images/avatar4.png',vehicles:[{type:'Hyundai Grand i10',plateNo:'WP-5681',capacity:5,category:'Hatchback'},{type:'Maruti Swift',plateNo:'WP-5682',capacity:5,category:'Hatchback'}],drivers:[{name:'Akbar Hassan',license:'B-45678901',phone:'+94 731234568'},{name:'Saman Kumara',license:'B-67890123',phone:'+94 751234567'},{name:'Thilak Fernando',license:'A-78901234',phone:'+94 761234567'}],status:'Pending',submitted:'13/01/2024',nicPhotocopy:'/images/nic_sample_4.jpg',licensePhotocopy:'/images/license_sample_4.jpg'},
  {id:5,name:'Island Hopper Tours',owner:'Piratheepan',agencyTagline:'Coastal & Wildlife Tours',email:'hello@islandhopper.lk',phone:'+94 72 345 6791',location:'Galle, Sri Lanka',memberSince:'Aug 2021',rating:4.7,avatar:'/images/avatar5.png',vehicles:[{type:'Hyundai Grand i10',plateNo:'WP-5683',capacity:5,category:'Hatchback'},{type:'Toyota Yaris',plateNo:'WP-5684',capacity:5,category:'Sedan'},{type:'Nissan Juke',plateNo:'WP-5685',capacity:5,category:'SUV'}],drivers:[{name:'Akbar Hassan',license:'B-45678901',phone:'+94 731234569'},{name:'Roshan Wijewardena',license:'B-89012345',phone:'+94 771234568'}],status:'Pending',submitted:'13/01/2024',nicPhotocopy:'/images/nic_sample_5.jpg',licensePhotocopy:'/images/license_sample_5.jpg'},
  {id:6,name:'Island Hopper Tours',owner:'Kirusighan',agencyTagline:'Coastal & Wildlife Tours',email:'hello@islandhopper.lk',phone:'+94 72 345 6792',location:'Galle, Sri Lanka',memberSince:'Sep 2021',rating:4.3,avatar:'/images/avatar6.png',vehicles:[{type:'Hyundai Grand i10',plateNo:'WP-5686',capacity:5,category:'Hatchback'},{type:'Skoda Rapid',plateNo:'WP-5687',capacity:5,category:'Sedan'}],drivers:[{name:'Akbar Hassan',license:'B-45678901',phone:'+94 731234567'},{name:'Godwin Perera',license:'B-90123456',phone:'+94 781234567'},{name:'Malik Hassan',license:'A-01234567',phone:'+94 791234567'}],status:'Pending',submitted:'13/01/2024',nicPhotocopy:'/images/nic_sample_6.jpg',licensePhotocopy:'/images/license_sample_6.jpg'}
]

export const mockHotels = [
  {id:1,name:'Ella Mountain View Resort',district:'Badulla',rooms:45,rating:4.8,image:ella_nine_arch,amenities:['Pool','Spa','Restaurant'],status:'Pending',ownerName:'Sanath Kumar',phone:'+94 701 234 567',email:'info@ellamountainview.lk',hotline:'+94 701 234 567',nicNumber:'123456789V',nicPhotocopy:ella_nine_arch,roomTypes:[
    {name:'Single Room',description:'1 person - compact and comfortable'},
    {name:'Double Room',description:'2 persons - cozy and affordable'},
    {name:'Twin Room',description:'2 separate beds - great for friends or colleagues'},
    {name:'Triple Room',description:'3 persons - extra bed included'},
  ]},
  {id:2,name:'Galle Fort Heritage Hotel',district:'Galle',rooms:62,rating:4.9,image:galle_fort,amenities:['Pool','Gym','Bar','Restaurant'],status:'Approved',ownerName:'Priya Fernando',phone:'+94 712 345 678',email:'contact@gallefort.lk',hotline:'+94 712 345 678',nicNumber:'987654321V',nicPhotocopy:galle_fort,roomTypes:[
    {name:'Single Room',description:'1 person - compact and comfortable'},
    {name:'Double Room',description:'2 persons - cozy and affordable'},
    {name:'Twin Room',description:'2 separate beds - great for friends or colleagues'},
    {name:'Triple Room',description:'3 persons - extra bed included'},
    {name:'Family Room',description:'Spacious room suitable for families'},
  ]},
  {id:3,name:'Mirissa Beach Resort',district:'Matara',rooms:38,rating:4.7,image:mirissa_beach,amenities:['Beach Access','Restaurant','Spa'],status:'Pending',ownerName:'Ravi Perera',phone:'+94 723 456 789',email:'bookings@mirisabeach.lk',hotline:'+94 723 456 789',nicNumber:'456789123V',nicPhotocopy:mirissa_beach,roomTypes:[
    {name:'Single Room',description:'1 person - compact and comfortable'},
    {name:'Double Room',description:'2 persons - cozy and affordable'},
    {name:'Twin Room',description:'2 separate beds - great for friends or colleagues'},
    {name:'Executive Room',description:'Business-class room with workspace'},
  ]},
  {id:4,name:'Kandy City Center Hotel',district:'Kandy',rooms:55,rating:4.6,image:kandy_temple,amenities:['Conference Hall','Restaurant','Pool'],status:'Approved',ownerName:'Amara Silva',phone:'+94 734 567 890',email:'reservations@kandycity.lk',hotline:'+94 734 567 890',nicNumber:'789123456V',nicPhotocopy:kandy_temple,roomTypes:[
    {name:'Single Room',description:'1 person - compact and comfortable'},
    {name:'Double Room',description:'2 persons - cozy and affordable'},
    {name:'Twin Room',description:'2 separate beds - great for friends or colleagues'},
    {name:'Family Room',description:'Spacious room suitable for families'},
    {name:'Executive Room',description:'Business-class room with workspace'},
  ]},
  {id:5,name:'Nuwara Eliya Grand Hotel',district:'Nuwara Eliya',rooms:72,rating:4.8,image:nuwara_eliya,amenities:['Golf Course','Restaurant','Spa','Wine Bar'],status:'Pending',ownerName:'Deepak Gunawardena',phone:'+94 745 678 901',email:'info@nuwaraeliyagrand.lk',hotline:'+94 745 678 901',nicNumber:'321654987V',nicPhotocopy:nuwara_eliya,roomTypes:[
    {name:'Single Room',description:'1 person - compact and comfortable'},
    {name:'Double Room',description:'2 persons - cozy and affordable'},
    {name:'Twin Room',description:'2 separate beds - great for friends or colleagues'},
    {name:'Deluxe Room',description:'Premium comfort with upgraded amenities'},
    {name:'Suite Room',description:'Luxury room with extra living space'},
  ]},
  {id:6,name:'Sigiriya Jungle Resort',district:'Dambulla',rooms:40,rating:4.5,image:sigiriya,amenities:['Nature Trail','Restaurant','Pool'],status:'Pending',ownerName:'Chaminda Jayawardena',phone:'+94 756 789 012',email:'contact@sigiriyajungle.lk',hotline:'+94 756 789 012',nicNumber:'654987321V',nicPhotocopy:sigiriya,roomTypes:[
    {name:'Single Room',description:'1 person - compact and comfortable'},
    {name:'Double Room',description:'2 persons - cozy and affordable'},
    {name:'Twin Room',description:'2 separate beds - great for friends or colleagues'},
    {name:'Suite Room',description:'Luxury room with extra living space'},
    {name:'Executive Room',description:'Business-class room with workspace'},
  ]}
]

export const mockPackages = [
  {id:1,title:'Sigiriya Cultural Heritage Tour',dest:'Sigiriya, Dambulla',price:450,duration:'3 Days / 2 Nights',provider:'Pinnacle Tours',tags:['Vesak','Poson'],status:'Pending',image:sigiriya,description:'Explore the ancient wonders of Sigiriya with expert guides. Visit historical temples, climb the iconic rock fortress, and experience local culture.',includes:['Accommodation','Meals','Transportation','Guide','Entry fees'],activities:[{day:1,title:'Arrival & Temple Visit',description:'Arrive at Dambulla, visit ancient Dambulla Cave Temples, explore 5 sacred caves with Buddha statues, overnight stay at hotel'},{day:2,title:'Sigiriya Rock Fortress',description:'Early morning hike to top of Sigiriya Rock, explore the ruins, visit mirror wall and royal chambers, evening leisure time'},{day:3,title:'Local Culture & Departure',description:'Visit local villages, learn about traditional crafts, enjoy cultural performance, depart for airport'}],photos:[sigiriya,ella_nine_arch,galle_fort]},
  {id:2,title:'Ella Adventure & Nature',dest:'Ella, Nuwara Eliya',price:580,duration:'4 Days / 3 Nights',provider:'Ceylon Safari Adventures',tags:['Sinhala New Year'],status:'Pending',image:ella_nine_arch,description:'Experience the lush green hills and adventure activities in Ella and Nuwara Eliya. Includes hiking, tea plantations, and spectacular views.',includes:['Accommodation','Meals','Transportation','Guide','Tea Plantation Tour','Hiking Equipment'],activities:[{day:1,title:'Arrival & Tea Plantation',description:'Arrive at Ella, visit working tea plantation, learn about tea production, enjoy fresh tea at plantation'},{day:2,title:'Nine Arch Bridge Hike',description:'Hike to the famous Nine Arch Bridge, explore surrounding villages, enjoy picnic lunch with views'},{day:3,title:'Nuwara Eliya Tour',description:'Visit Gregory Lake, golf course, postal museum, evening walk in city center'},{day:4,title:'Nature Trail & Departure',description:'Morning nature walk, birdwatching, return to base and departure'}],photos:[ella_nine_arch,nuwara_eliya]},
  {id:3,title:'Beach Paradise - Mirissa',dest:'Mirissa, Matara',price:420,duration:'2 Days / 2 Nights',provider:'Pinnacle Tours',tags:['Beach','Water Sports'],status:'Pending',image:mirissa_beach,description:'Relax on pristine sandy beaches, enjoy water sports, spot whales, and experience beach village life in beautiful Mirissa.',includes:['Accommodation','Meals','Beach Equipment','Water Sports','Whale Watching Tour'],activities:[{day:1,title:'Beach Relaxation & Water Sports',description:'Settle into beachfront accommodation, enjoy water sports (surfing, paddleboarding), sunset beach walk'},{day:2,title:'Whale Watching & Departure',description:'Early morning whale watching tour, visit local fish market, lunch at beachside restaurant, afternoon departure'}],photos:[mirissa_beach,galle_fort]},
  {id:4,title:'Temple Tour - Kandy',dest:'Kandy',price:350,duration:'1 Day',provider:'Ceylon Heritage Tours',tags:['Cultural','Temple'],status:'Approved',image:kandy_temple,description:'Visit sacred temples in Kandy, explore the spiritual heart of Sri Lanka. Includes Temple of the Tooth and scenic lake views.',includes:['Meals','Transportation','Guide','Temple Entry','Museum Visit'],activities:[{day:1,title:'Kandy Temple Heritage Tour',description:'Visit iconic Temple of the Tooth, explore Kandy Lake, visit Buddhist museums, experience evening Pooja ceremony, cultural shows'}],photos:[kandy_temple,sigiriya]},
  {id:5,title:'Nuwara Eliya Mountain Trek',dest:'Nuwara Eliya',price:520,duration:'3 Days / 2 Nights',provider:'Adventure Routes Co',tags:['Trekking','Nature'],status:'Pending',image:nuwara_eliya,description:'Challenge yourself with mountain trekking experiences in Nuwara Eliya highlands. Stunning mountain views and cool climate awaits.',includes:['Accommodation','Meals','Trekking Equipment','Professional Guide','Maps & Navigation'],activities:[{day:1,title:'Arrival & Acclimation',description:'Arrive in Nuwara Eliya, visit Gregory Lake, evening tea at historic hotel'},{day:2,title:'Mount Pidurutalagala Trek',description:'Trek Sri Lanka\'s highest mountain, enjoy panoramic views, visit radio station at peak, return for refreshments'},{day:3,title:'Tea Gardens & Departure',description:'Visit tea gardens on way down, tour factory, depart with tea samples'}],photos:[nuwara_eliya,ella_nine_arch]},
]

export const mockBookings = [
  {id:1,tourist:'John Smith',package:'Sigiriya Cultural Heritage Tour',agent:'Pinnacle Tours',date:'2024-05-12',payment:'Paid',status:'Pending'},
]

export const mockTransactions = [
  {id:'TXN-001',booking:'BK-2024-001',date:'15/01/2024',tourist:'John Smith',provider:'Pinnacle Tours',type:'Payment',amount:900,commission:90,status:'Completed'},
  {id:'TXN-002',booking:'BK-2024-002',date:'14/01/2024',tourist:'Emma Wilson',provider:'Island Hopper',type:'Payment',amount:1440,commission:144,status:'Completed'},
  {id:'TXN-003',booking:'BK-2024-003',date:'13/01/2024',tourist:'Michael Brown',provider:'Ceylon Safari',type:'Payment',amount:580,commission:58,status:'Completed'},
  {id:'TXN-004',booking:'BK-2024-004',date:'12/01/2024',tourist:'Sarah Johnson',provider:'Beach Tours Co',type:'Refund',amount:300,commission:30,status:'Completed'},
  {id:'TXN-005',booking:'BK-2024-005',date:'11/01/2024',tourist:'David Wilson',provider:'Mountain Trails',type:'Payment',amount:720,commission:72,status:'Pending'},
]
