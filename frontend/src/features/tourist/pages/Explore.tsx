import { useState, useMemo, useCallback, memo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import beachResort from "@/assets/images/beach-resort.jpeg";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { TravelCard } from "@/features/tourist/components/dashboard/TravelCard";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/common/ui/select";
import {
    Compass,
    SlidersHorizontal,
    Sparkles,
    TrendingUp,
    MapPin,
    Sun,
    Mountain,
    Palmtree,
    Building2,
    X,
} from "lucide-react";
import { cn } from "@/features/tourist/services/utils";
import { useAllPackages, useRecommendations } from "@/features/tourist/hooks/useApi";
import { CardGridSkeleton, RecommendationSkeleton } from "@/components/common/ui/skeletons";
import { defaultUserId } from "@/features/tourist/services/userHelpers";

const categories = [
    { id: "all", label: "All", icon: Compass },
    { id: "beach", label: "Beach", icon: Palmtree },
    { id: "mountain", label: "Mountain", icon: Mountain },
    { id: "city", label: "City", icon: Building2 },
    { id: "tropical", label: "Tropical", icon: Sun },
    { id: "wildlife", label: "Wildlife", icon: Sparkles },
    { id: "culture", label: "Culture", icon: MapPin },
];

// Memoized TravelCard to prevent unnecessary re-renders when filters change
const MemoizedTravelCard = memo(TravelCard);

const Explore = () => {
    const { isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedDistrict, setSelectedDistrict] = useState("all");
    const [sortBy, setSortBy] = useState("rating");

    // SWR hooks — cached, deduplicated, background revalidated
    const { data: allPackages = [], isLoading: packagesLoading } = useAllPackages();
    const { data: trendingPackages = [], isLoading: trendingLoading } = useRecommendations(defaultUserId());

    // Search suggestions logic
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const suggestions = allPackages
                .filter((pkg) =>
                    pkg.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||   //Search by district
                    pkg.packageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||   //Search by package name
                    pkg.category?.toLowerCase().includes(searchQuery.toLowerCase())   //Search by category
                )
                .map((pkg) => ({
                    id: pkg.id,
                    district: pkg.district,
                    packageName: pkg.packageName,
                }))
                .filter(
                    (item, index, self) =>
                        index === self.findIndex((t) => t.district === item.district)
                );
            setSearchSuggestions(suggestions);
            setShowSuggestions(true);   //Show Results
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);  //Hide Results
        }
    }, [searchQuery, allPackages]);

    // Memoize districts list — only Unique Districts(Using Set)
    const districts = useMemo(() =>
        Array.from(                                           // converts Set back to Array
            new Set(allPackages.map((pkg) => pkg.district).filter(Boolean))   // removes duplicates (Using Set)
        ).sort(),               //Alphabetical Order
        [allPackages]
    );

    // Memoize filtered + sorted packages — avoids recalculation on unrelated state changes
    const filteredPackages = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return allPackages
            .filter((pkg) => {
                const matchesSearch =
                    pkg.district?.toLowerCase().includes(query) ||
                    pkg.packageName?.toLowerCase().includes(query) ||
                    pkg.category?.toLowerCase().includes(query);
                const matchesCategory =
                    selectedCategory === "all" || (pkg.category && pkg.category.toLowerCase() === selectedCategory.toLowerCase());
                const matchesDistrict =
                    selectedDistrict === "all" || pkg.district === selectedDistrict;
                return matchesSearch && matchesCategory && matchesDistrict;
            })
            .sort((a, b) => {                                                    //Sorting
                if (sortBy === "price-low") return (a.basePriceAdult || 0) - (b.basePriceAdult || 0);
                if (sortBy === "price-high") return (b.basePriceAdult || 0) - (a.basePriceAdult || 0);
                if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
                if (sortBy === "rating-low") return (a.rating || 0) - (b.rating || 0);
                return 0;
            });
    }, [allPackages, searchQuery, selectedCategory, selectedDistrict, sortBy]);

    // Stable callback refs for category/filter changes
    const handleCategoryChange = useCallback((id) => setSelectedCategory(id), []);          //UseCallback effect
    const handleDistrictChange = useCallback((val) => setSelectedDistrict(val), []);        //District Selection
    const handleSortChange = useCallback((val) => setSortBy(val), []);                      //Sort Selection

    return (
        <DashboardLayout>
            {/* Hero Section */}
            <section className="relative rounded-3xl mb-8 animate-slide-up z-40">
                {/* Background beach image for exploring */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    <img
                        src={beachResort}                                     //Img from Public Folder 
                        alt="Hero Background"
                        className="h-full w-full object-cover"
                    />
                    {/* Subtle dark overlay to ensure white text is readable */}
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="relative px-8 py-12 lg:py-20 flex flex-col items-center text-center text-white">
                    <div className="mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-black/40 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/20 transition-all duration-300 cursor-default group">
                        <span className="text-lg group-hover:scale-125 transition-transform duration-300">✨</span>
                        <span className="text-sm font-semibold tracking-widest uppercase text-white/95 drop-shadow-sm">
                            Start Your Adventure
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
                        Find Your Next <span className="text-accent italic">Dream</span> Destination
                    </h1>

                    {/* Search Bar */}
                    <div className="w-full max-w-3xl bg-white p-2 rounded-2xl shadow-elevated flex flex-col md:flex-row items-center gap-2 relative z-50">
                        <div className="flex-1 flex items-center gap-3 px-4 w-full relative">
                            <MapPin className="h-5 w-5 text-primary" />
                            <input
                                type="text"
                                placeholder="Where are you going?"
                                className="bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground w-full py-3"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                            />
                            {searchQuery && (                       //SearchQuery start search function above
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setShowSuggestions(false);
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="hidden md:block w-px h-10 bg-border mx-2" />
                        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 text-lg shadow-glow">        {/*Search btn click to get data*/}
                            Search
                        </Button>

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-border/50 rounded-2xl shadow-elevated z-[60] overflow-hidden text-left animate-in fade-in zoom-in duration-200">
                                <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                    {searchSuggestions.map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            onClick={() => {
                                                setSearchQuery(suggestion.district || "");
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full px-4 py-4 text-left hover:bg-primary/5 flex items-center gap-4 transition-colors border-b border-border/30 last:border-b-0 group"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <Compass className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-foreground truncate text-base">{suggestion.packageName}</p>
                                                <p className="text-sm text-muted-foreground truncate">{suggestion.district}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showSuggestions && searchQuery.trim().length > 0 && searchSuggestions.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-border/50 rounded-2xl shadow-elevated z-[60] p-8 text-center text-muted-foreground animate-in fade-in zoom-in duration-200">
                                <div className="h-12 w-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <MapPin className="h-6 w-6 opacity-40" />
                                </div>
                                <p className="font-medium">No destinations found for "{searchQuery}"</p>                        {/* Serch not found */}
                                <p className="text-sm opacity-70">Try searching for a city, district, or category</p>
                            </div>
                        )}
                    </div>
                    {/* Search Bar Ends */}

                    <p className="text-lg lg:text-xl text-white/90 max-w-2xl mb-8 mt-6">
                        Explore hand-picked packages, luxury hotels, and hidden gems around the <span className="text-accent italic text-xl font-bold">Srilanka</span>
                    </p>
                </div>
            </section>

            {/* Trending Section - Hidden when searching or for guests */}
            {isAuthenticated && !searchQuery && (
                <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Top Picks for You</h2>
                                <p className="text-muted-foreground text-sm">Most loved destinations this week</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide">
                        {trendingLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <RecommendationSkeleton key={i} />)
                        ) : (
                            trendingPackages.map((pkg) => (                       // Display Top Recommendations from RecommendationService.java
                                <MemoizedTravelCard key={pkg.id} recommendation={pkg} className="w-72 flex-shrink-0" />
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* Filters & Sorting */}
            <section className="animate-slide-up py-8" style={{ animationDelay: "0.15s" }}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-border/50 shadow-soft overflow-hidden">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? "default" : "ghost"}
                                    className={cn(
                                        "h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold",
                                        selectedCategory === category.id
                                            ? "bg-primary text-white shadow-glow scale-105"
                                            : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
                                    )}
                                    onClick={() => handleCategoryChange(category.id)}
                                >
                                    <category.icon className={cn(
                                        "h-4 w-4 mr-2 transition-transform",
                                        selectedCategory === category.id ? "scale-110" : ""         //Category Icons
                                    )} />
                                    {category.label}                                                 {/*Category name */}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">                   {/* District Selection */}
                        <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-white border-border/50 rounded-xl h-11 shadow-soft hover:shadow-card transition-all">
                                <MapPin className="mr-2 h-4 w-4 text-primary" />
                                <SelectValue placeholder="All Districts" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50 shadow-elevated">
                                <SelectItem value="all">All Districts</SelectItem>
                                {districts.map((district) => (
                                    <SelectItem key={district} value={district}>
                                        {district}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-white border-border/50 rounded-xl h-11 shadow-soft hover:shadow-card transition-all">
                                <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
                                <SelectValue placeholder="Sort by Rating" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50 shadow-elevated">
                                <SelectItem value="rating">Highest Rating</SelectItem>                   {/* Rating Sort */}
                                <SelectItem value="rating-low">Lowest Rating</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>            {/* Price Sort */}
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            {/* All Packages */}
            <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">All Packages</h2>
                    <Badge variant="secondary">{filteredPackages.length} available</Badge>                  {/* Package count */}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {packagesLoading ? (
                        <CardGridSkeleton count={10} />
                    ) : (
                        <>
                            {filteredPackages.map((pkg) => (                                                //Travelcard mapping
                                <MemoizedTravelCard key={pkg.id} recommendation={pkg} className="w-full" />
                            ))}
                            {filteredPackages.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />                  {/* No packages found message */}
                                    <p>No packages found matching your criteria</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
};

export default Explore;