import { Star, ChevronRight, Sun, Moon, MapPin, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
    HoverCard,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

export function TravelCard({ recommendation, className, onClick, children, showHotelHeader }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(`/explore/package/${recommendation.id}`);
        }
    };

    return (
        <div
            className={cn(
                "group relative flex flex-col flex-shrink-0 overflow-hidden rounded-2xl bg-card border border-border/50",
                showHotelHeader ? (children ? "h-[310px]" : "h-[265px]") : "h-[350px]",
                "shadow-soft transition-all duration-500 hover:shadow-elevated hover:-translate-y-1 cursor-pointer",
                className
            )}
            onClick={handleClick}
        >
            {/* Image */}
            <div className={cn(
                "relative overflow-hidden",
                showHotelHeader ? "h-32" : "h-48"
            )}>
                <img
                    src={recommendation.imageUrl}
                    alt={recommendation.destination}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />

                {/* Top Pick Badge */}
                {recommendation.rating >= 4.5 && (
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
                showHotelHeader ? "p-2" : "p-3.5"
            )}>

                {/* For Hotel Details */}
                {showHotelHeader ? (
                    <>
                        {/* Hotel Name */}
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-0.5 min-h-[1.5rem] text-base leading-tight whitespace-normal break-words">
                            {recommendation.hotelName}
                        </h3>
                        {/* Location */}
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {recommendation.location}
                        </p>

                        {/* District  */}
                        <div className="flex items-center justify-between gap-2 mt-auto pt-1.5 border-t-2 border-border/100">
                            {recommendation.district && (
                                <div className="flex items-center gap-1 text-xs text-foreground font-bold">
                                    <MapPin className="h-3 w-3 text-foreground" />
                                    <span>{recommendation.district}</span>
                                </div>
                            )}

                        {/* Price Range */}
                            <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-s font-bold whitespace-nowrap shadow-sm border border-primary/5">
                                {/* Display price range for hotel from rooms (calculation done in Hotel.jsx ) */}
                                {Number.isFinite(recommendation?.priceFrom) && Number.isFinite(recommendation?.priceTo)
                                    ? `$${recommendation.priceFrom} - $${recommendation.priceTo}`
                                    : "Not Available"}
                            </div>
                        </div>
                    </>
                ) : (

                    // For Package Details
                    <>
                        <div className="mb-3 min-h-[4.5rem]">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {recommendation.packageName}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {recommendation.destination}
                                {recommendation.district ? `, ${recommendation.district}` : ""}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t-2 border-border mt-auto">
                            <div className="flex flex-col text-sm text-foreground">
                                {recommendation.priceFrom && (
                                    <span className="text-base font-bold text-foreground">
                                         ${recommendation.priceFrom} - ${recommendation.priceTo}
                                    </span>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                    {(() => {
                                        const dur = recommendation.duration || "";
                                        const match = dur.match(/(\d+)/);
                                        const days = match ? parseInt(match[1], 10) : 0;
                                        const nights = Math.max(0, days > 0 ? days - 1 : 0);
                                        if (days > 0) {
                                            return (
                                                <div className="flex items-center gap-3 text-foreground font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <Sun className="h-3.5 w-3.5 text-yellow-400" />
                                                        <span className="text-xs font-semibold">{days} day{days > 1 ? "s" : ""}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Moon className="h-3.5 w-3.5 text-sky-500" />
                                                        <span className="text-xs font-semibold">{nights} night{nights > 1 ? "s" : ""}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>

                             <Button size="sm" className="h-8 bg-sidebar-primary text-sidebar-primary-foreground shadow-soft text-xs px-3">
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