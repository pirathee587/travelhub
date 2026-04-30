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
                "group relative flex flex-col flex-shrink-0 w-72 h-full overflow-hidden rounded-xl bg-card border border-border",
                "shadow-card transition-all duration-300 hover:shadow-elevated cursor-pointer",
                className
            )}
            onClick={handleClick}
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
                <img
                    src={recommendation.imageUrl}
                    alt={recommendation.destination}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />

                {/* Rating badge */}
                <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm border border-border/50 transition-transform hover:scale-105">
                            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                            <span className="text-sm font-medium">{recommendation.rating}</span>
                            <span className="text-xs text-muted-foreground">({recommendation.reviewCount})</span>
                        </div>
                    </HoverCardTrigger>
                </HoverCard>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">

                {/* Hotel Details */}
                {showHotelHeader ? (
                    <>
                        {/* Hotel Name */}
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                            {recommendation.hotelName}
                        </h3>

                        {/* District */}
                        {recommendation.district && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <MapPin className="h-3 w-3" />
                                <span>{recommendation.district}</span>
                            </div>
                        )}

                        {/* Price Range */}
                        <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-auto pt-2 border-t border-border">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>${recommendation.priceFrom} - ${recommendation.priceTo} / night</span>
                        </div>
                    </>
                ) : (

                    // For Package Details
                    <>
                        <div className="mb-3">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {recommendation.destination}
                            </h3>
                            <p className="text-sm text-muted-foreground">{recommendation.packageName}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                            <div className="flex flex-col text-xs text-muted-foreground">
                                {recommendation.priceFrom && (
                                    <span className="text-sm font-semibold text-foreground">
                                        From ${recommendation.priceFrom}
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
                                                <div className="flex items-center gap-3 text-muted-foreground">
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

                            <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                                View
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </>
                )}

                {children && <div className="pt-2">{children}</div>}
            </div>
        </div>
    );
}