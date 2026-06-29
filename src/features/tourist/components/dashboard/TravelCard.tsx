//Only on Explore page and Hotel page 
import { Star, ChevronRight, Sun, Moon, MapPin, DollarSign } from "lucide-react";
import { cn } from "@/features/tourist/services/utils";
import { Button } from "@/components/common/ui/button";
import { useNavigate } from "react-router-dom";
import {
    HoverCard,
    HoverCardTrigger,
} from "@/components/common/ui/hover-card";

export function TravelCard({ recommendation, className, onClick, children, showHotelHeader, isSelectionMode }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(`/tourist/explore/package/${recommendation.id}`);          // "Package details" page navigation
        }                                                               //App.jsx
    };

    return (
        <div
            className={cn(
                "group relative flex flex-col flex-shrink-0 overflow-hidden rounded-2xl bg-card border-2 border-primary/20 h-full min-h-[320px]",
                "shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/60 cursor-pointer",
                className
            )}
            onClick={handleClick}
        >
            {/* Image */}
            <div className={cn(
                "relative overflow-hidden",
                showHotelHeader ? "h-36" : "h-48"
            )}>
                <img
                    src={recommendation.imageUrl}
                    alt={recommendation.destination}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />

                {/* Top Pick Badge Show the Badge if package rating is above 4.5. For hotels, only show in selection mode. */}
                {recommendation.rating >= 4.5 && (!showHotelHeader || isSelectionMode) && (          
                    <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm z-10 animate-fade-in">
                        Top Pick
                    </div>
                )}

                {/* Rating badge */}
                <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full px-2.5 py-1 shadow-sm border border-border transition-transform hover:scale-110">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span className="text-sm font-bold text-foreground">{recommendation.rating}</span>
                        </div>
                    </HoverCardTrigger>
                </HoverCard>
            </div>

            {/* Content */}
            <div className={cn(
                "flex flex-col flex-1 min-h-0",
                showHotelHeader ? "p-4" : "p-3.5"
            )}>

                {/* For Hotel Details */}
                {showHotelHeader ? (
                    <>
                        <div className="mb-4">
                            {/* Hotel Name */}
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1 min-h-[1.5rem] text-lg leading-tight line-clamp-1">
                                {recommendation.hotelName}
                            </h3>
                            {/* Location */}
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground/80 mt-1.5">
                                <MapPin className="h-4 w-4 text-primary/80 flex-shrink-0" />
                                <span className="line-clamp-1">{recommendation.location}</span>
                            </div>
                            {/* Description snippet */}
                            {recommendation.description && (
                                <p className="text-[13px] text-muted-foreground leading-relaxed mt-2.5 line-clamp-2 border-l-2 border-border/60 pl-2">
                                    {recommendation.description}
                                </p>
                            )}
                            
                            {/* Amenities slice (up to 2) */}
                            {recommendation.amenities && recommendation.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2.5">
                                    {recommendation.amenities.slice(0, 2).map((amenity, idx) => (
                                        <span key={idx} className="bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-sm font-medium border border-border/40 shadow-sm">
                                            {amenity}
                                        </span>
                                    ))}
                                    {recommendation.amenities.length > 2 && (
                                        <span className="text-xs text-muted-foreground px-1 py-0.5 font-medium">+{recommendation.amenities.length - 2} more</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bottom Row: Price and Button */}
                        <div className="flex items-end justify-between pt-3 border-t border-border/50 mt-auto">
                            {/* Price Range */}
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Price Range</span>
                                {Number.isFinite(recommendation?.priceFrom) && Number.isFinite(recommendation?.priceTo)
                                    ? <span className="text-lg font-extrabold text-primary">${recommendation.priceFrom} - ${recommendation.priceTo}</span>
                                    : <span className="text-base font-semibold text-muted-foreground">Not Available</span>}
                            </div>

                            {/* Details Button */}
                            {!children && (
                                <Button size="sm" className="h-8 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-sm text-xs px-3 transition-colors" onClick={(e) => {
                                    e.stopPropagation();
                                    handleClick();
                                }}>
                                    Details
                                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            )}
                        </div>
                    </>
                ) : (

                    // For Package Details
                    <>
                        <div className="mb-3 min-h-[4.5rem]">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {recommendation.packageName}  {/*Package name*/}
                            </h3>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 line-clamp-1">
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{recommendation.district}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t-2 border-border mt-auto">
                            <div className="flex flex-col text-sm text-foreground">
                                {recommendation.basePriceAdult && (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Starts from</span>
                                        <span className="text-base font-bold text-foreground">
                                             ${recommendation.basePriceAdult}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                    {(() => {
                                        const dur = recommendation.duration || "";   //Days and Night Calculation
                                        const match = dur.match(/(\d+)/);
                                        const days = match ? parseInt(match[1], 10) : 0;
                                        const nights = Math.max(0, days > 0 ? days - 1 : 0);
                                        if (days > 0) {
                                            return (
                                                <div className="flex items-center gap-3 text-foreground font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <Sun className="h-3.5 w-3.5 text-yellow-400" />
                                                        <span className="text-xs font-semibold">{days} day{days > 1 ? "s" : ""}</span>  {/*Days */}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Moon className="h-3.5 w-3.5 text-sky-500" />
                                                        <span className="text-xs font-semibold">{nights} night{nights > 1 ? "s" : ""}</span>  {/*Nights */}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>
                                    
                            {/* Details Button */}
                             <Button size="sm" className="h-8 bg-sidebar-primary text-sidebar-primary-foreground shadow-soft text-xs px-3" onClick={handleClick}>
                                Details
                                <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </div>
                    </>
                )}

                {children && <div className="pt-2">{children}</div>}
            </div>
        </div>
    );
}