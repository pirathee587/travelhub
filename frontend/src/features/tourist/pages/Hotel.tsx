import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { TravelCard } from "@/features/tourist/components/dashboard/TravelCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/common/ui/select";
import { Input } from "@/components/common/ui/input";
import { Building2, MapPin, Search, ArrowLeft, SlidersHorizontal } from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { useState, useMemo, useCallback, memo } from "react";
import { useAllHotels, useHotelPriceRanges } from "@/features/tourist/hooks/useApi";

import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { CardGridSkeleton } from "@/components/common/ui/skeletons";

const MemoizedTravelCard = memo(TravelCard);

const Hotel = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedDistrict, setSelectedDistrict] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("rating");
    const districtParam = searchParams.get("district");

    // Check if we're in selection mode
    const isSelectionMode = searchParams.get("mode") === "select";
    const preferenceNumber = searchParams.get("preference");
    const returnTo = searchParams.get("returnTo");

    // Always fetch all hotels to allow flexible local filtering of district
    const { data: hotels = [], isLoading } = useAllHotels(null);
    const hotelIds = useMemo(() => hotels.map((hotel) => hotel.id).filter(Boolean), [hotels]);
    const { data: roomPriceRanges = {} } = useHotelPriceRanges(hotelIds);

    // Sync district param to local state, normalizing it to remove " District"
    useState(() => {
        if (districtParam) {
            setSelectedDistrict(districtParam.replace(/ district$/i, "").trim());
        }
    });

    const dynamicDistricts = useMemo(() => {
        const uniqueDists = new Set(
            hotels
                .map((hotel) => hotel.district)
                .filter(Boolean)
                .map((d) => d.replace(/ district$/i, "").trim())
        );
        return Array.from(uniqueDists).sort();
    }, [hotels]);
  
    // Combine hotel data with price ranges from rooms
    const hotelsWithRoomPrice = useMemo(() =>
        hotels.map((hotel) => {
            const roomRange = roomPriceRanges[hotel.id];
            if (!roomRange) {
                return {
                    ...hotel,
                    priceFrom: null,
                    priceTo: null,
                };
            }

            return {
                ...hotel,
                priceFrom: roomRange.priceFrom, // Minimum price among rooms
                priceTo: roomRange.priceTo,     // Maximum price among rooms
            };
        }),
        [hotels, roomPriceRanges] //Exported to TravelCard for display in hotel Price Range
    );

    const filteredHotels = useMemo(() =>
        hotelsWithRoomPrice
            .filter((hotel) => {
                const matchesApproved = hotel.applicationStatus === "Approved";  //show hotels if only "Approved" from Hotel Table 
                
                const nHotelDist = hotel.district?.replace(/ district$/i, "").trim() || "";
                const nSelectedDist = selectedDistrict === "all" ? "all" : selectedDistrict?.replace(/ district$/i, "").trim() || "";
                const matchesDistrict = nSelectedDist === "all" || nHotelDist.toLowerCase() === nSelectedDist.toLowerCase(); //Flexible District filter
                
                const matchesSearch = hotel.hotelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    hotel.destination?.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesApproved && matchesDistrict && matchesSearch;
            })
            .sort((a, b) => {                       // Sorting based on the selected sortBy value
                const getPrice = (hotel) => Number.isFinite(hotel?.priceFrom) ? hotel.priceFrom : null;
                const aPrice = getPrice(a);
                const bPrice = getPrice(b);

                if (sortBy === "price-low") {                   //Sorting by price low to high
                    if (aPrice == null && bPrice == null) return 0;
                    if (aPrice == null) return 1;
                    if (bPrice == null) return -1;
                    return aPrice - bPrice;
                }
                if (sortBy === "price-high") {                   //Sorting by price high to low 
                    if (aPrice == null && bPrice == null) return 0;
                    if (aPrice == null) return 1;
                    if (bPrice == null) return -1;
                    return bPrice - aPrice;
                }
                if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);          //Sorting by rating high to low
                if (sortBy === "rating-low") return (a.rating || 0) - (b.rating || 0);      //Sorting by rating low to high
                return 0;
            }),
        [hotelsWithRoomPrice, selectedDistrict, searchQuery, sortBy]
    );

    const handleHotelClick = useCallback((hotelId) => {
        if (isSelectionMode && returnTo && preferenceNumber) {
            navigate(`/hotels/${hotelId}?mode=select&preference=${preferenceNumber}&returnTo=${encodeURIComponent(returnTo)}`);
        } else {
            navigate(`/tourist/hotels/${hotelId}`);
        }
    }, [isSelectionMode, returnTo, preferenceNumber, navigate]);

    const handleSelectHotel = useCallback((hotelId, e) => {
        e.stopPropagation();
        if (isSelectionMode && returnTo && preferenceNumber) {
            navigate(`${returnTo}?selectedHotel=${hotelId}&preference=${preferenceNumber}`);
        }
    }, [isSelectionMode, returnTo, preferenceNumber, navigate]);

    const handleDistrictChange = useCallback((val) => setSelectedDistrict(val), []);
    const handleSortChange = useCallback((val) => setSortBy(val), []);

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-slide-up">
                {isSelectionMode && returnTo && (
                    <Button
                        variant="ghost"
                        onClick={() => navigate(returnTo)}
                        className="pl-0 hover:bg-transparent hover:text-primary transition-colors mb-[-10px]"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reservation
                    </Button>
                )}

                {/* Header */}
                <section className="animate-slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold">
                                    Hotels
                                </h1>
                                <p className="text-muted-foreground">
                                    {isSelectionMode
                                        ? "Choose a hotel for your package reservation"
                                        : "Find the perfect stay for your journey"}
                                </p>
                            </div>
                        </div>
                        {isSelectionMode && (
                            <Badge variant="outline" className="border-primary text-primary self-start sm:self-center">
                                Preference {preferenceNumber}
                            </Badge>
                        )}
                    </div>
                </section>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />               {/* Search Bar */}
                        <Input
                            placeholder="Search hotels..."
                            className="pl-10 bg-card"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={isSelectionMode}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-card">
                            <Building2 className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        {/* District Dropdown */}
                        <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>                        {/*District list using map function*/}
                            {dynamicDistricts.map((district) => (
                                <SelectItem key={district} value={district}>
                                    {district}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-card">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort by Rating" />
                        </SelectTrigger>
                        {/* Sort By Dropdown */}

                        <SelectContent>
                            <SelectItem value="rating">Highest Rated</SelectItem>                       {/* Sorting List */}
                            <SelectItem value="rating-low">Lowest Rating</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Hotels grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> 
                    {isLoading ? (
                        <CardGridSkeleton count={10} showHotelHeader />
                    ) : (
                        filteredHotels.map((hotel) => ( //map hotels to travel card component. filter above
                            <MemoizedTravelCard                 //Travel card
                                key={hotel.id}
                                recommendation={hotel}
                                className="w-full"
                                onClick={() => handleHotelClick(hotel.id)}
                                showHotelHeader
                                isSelectionMode={isSelectionMode}
                            >
                                {isSelectionMode && (
                                    <Button
                                        className="w-full gradient-ocean text-white shadow-lg mt-2"
                                        onClick={(e) => handleSelectHotel(hotel.id, e)}
                                    >
                                        Select This Hotel
                                    </Button>
                                )}
                            </MemoizedTravelCard>
                        ))
                    )}
                </div>

                {!isLoading && filteredHotels.length === 0 && ( // if no hotels found
                    <div className="text-center py-12">
                        <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-lg font-medium text-muted-foreground">No hotels found</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Hotel;
