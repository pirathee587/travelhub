import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Search, ArrowLeft } from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { useState, useEffect } from "react";
import { api } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";



const Hotel = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedDistrict, setSelectedDistrict] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const districtParam = searchParams.get("district");

    // Check if we're in selection mode
    const isSelectionMode = searchParams.get("mode") === "select";
    const preferenceNumber = searchParams.get("preference");
    const returnTo = searchParams.get("returnTo");
    const [hotels, setHotels] = useState([]);

    const dynamicDistricts = Array.from(
        new Set(
            hotels
                .map((hotel) => hotel.district)
                .filter(Boolean)
        )
    ).sort();

    useEffect(() => {
        api.getAllHotels().then(data => {
            setHotels(data);
        });
    }, []);

    useEffect(() => {
        if (districtParam) {
            setSelectedDistrict(districtParam);
        }
    }, [districtParam]);

    const filteredHotels = hotels.filter((hotel) => {
        const matchesDistrict = selectedDistrict === "all" || hotel.district === selectedDistrict;
        const matchesSearch = hotel.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.destination.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDistrict && matchesSearch;
    });

    const handleHotelClick = (hotelId) => {
        // Always navigate to hotel details when clicking the card
        if (isSelectionMode && returnTo && preferenceNumber) {
            // Pass selection context to hotel details page
            navigate(`/hotels/${hotelId}?mode=select&preference=${preferenceNumber}&returnTo=${encodeURIComponent(returnTo)}`);
        } else {
            // Normal navigation to hotel details
            navigate(`/hotels/${hotelId}`);
        }
    };

    const handleSelectHotel = (hotelId, e) => {
        e.stopPropagation();
        if (isSelectionMode && returnTo && preferenceNumber) {
            // Navigate back to reservation page with selected hotel
            navigate(`${returnTo}?selectedHotel=${hotelId}&preference=${preferenceNumber}`);
        }
    };

    return (
        <DashboardLayout showSearch={false}>
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
                            <div className="h-12 w-12 rounded-xl gradient-ocean flex items-center justify-center shadow-glow">
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search hotels..."
                            className="pl-10 bg-card"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-card">
                            <Building2 className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {dynamicDistricts.map((district) => (
                                <SelectItem key={district} value={district}>
                                    {district}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredHotels.map((hotel) => (
                        <RecommendationCard
                            key={hotel.id}
                            recommendation={hotel}
                            className="w-full"
                            onClick={() => handleHotelClick(hotel.id)}
                            showHotelHeader
                        >
                            {isSelectionMode && (
                                <Button
                                    className="w-full gradient-ocean text-white shadow-lg mt-2"
                                    onClick={(e) => handleSelectHotel(hotel.id, e)}
                                >
                                    Select This Hotel
                                </Button>
                            )}
                        </RecommendationCard>
                    ))}
                </div>

                {filteredHotels.length === 0 && (
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
