import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    X,
    MapPin,
    CreditCard,
    Hash,
    Calendar as CalendarIcon,
    Eye,
} from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { cn } from "@/features/tourist/services/utils";
import placeholderImg from "@/assets/images/placeholder.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripResponse {
    id: number;
    packageId?: number;
    packageName?: string;
    destination?: string;
    startDate?: string; // "YYYY-MM-DD"
    endDate?: string;   // "YYYY-MM-DD"
    status?: string;
    paymentStatus?: string;
    district?: string;
    imageUrl?: string;
    price?: number;
    rating?: number;
}

interface BookingCalendarProps {
    trips: TripResponse[];
    isLoading: boolean;
    onOpenTripDetails: (trip: TripResponse) => void;
}

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        dot: string;
        badge: string;
        pill: string;
        border: string;
        text: string;
    }
> = {
    pending: {
        label: "Pending",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        pill: "bg-amber-50/95 text-amber-900 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
        border: "border-amber-400",
        text: "text-amber-600",
    },
    confirmed: {
        label: "Confirmed",
        dot: "bg-blue-500",
        badge: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        pill: "bg-blue-50/95 text-blue-900 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800",
        border: "border-blue-400",
        text: "text-blue-600",
    },
    paid: {
        label: "Paid",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        pill: "bg-emerald-50/95 text-emerald-900 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800",
        border: "border-emerald-400",
        text: "text-emerald-600",
    },
    in_progress: {
        label: "In Progress",
        dot: "bg-purple-500",
        badge: "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
        pill: "bg-purple-50/95 text-purple-900 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800",
        border: "border-purple-400",
        text: "text-purple-600",
    },
    completed: {
        label: "Completed",
        dot: "bg-slate-500",
        badge: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        pill: "bg-slate-100/95 text-slate-800 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
        border: "border-slate-400",
        text: "text-slate-600",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-red-500",
        badge: "bg-red-50 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
        pill: "bg-red-50/95 text-red-900 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800",
        border: "border-red-400",
        text: "text-red-600",
    },
};

const getStatusConfig = (status?: string) => {
    const key = status?.toLowerCase() ?? "pending";
    return STATUS_CONFIG[key] ?? STATUS_CONFIG.pending;
};

// ─── Date Helpers ──────────────────────────────────────────────────────────────

const parseDate = (d?: string): Date | null => {
    if (!d) return null;
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
};

const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

interface CalendarDateItem {
    date: Date;
    isCurrentMonth: boolean;
    colIndex: number; // 0 = Sun ... 6 = Sat
    rowIndex: number; // 0 to 5
}

function buildFullCalendarGrid(year: number, month: number): CalendarDateItem[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay(); // 0 = Sun
    const items: CalendarDateItem[] = [];

    // Previous month tail
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevLastDay - i);
        const idx = items.length;
        items.push({
            date: d,
            isCurrentMonth: false,
            colIndex: idx % 7,
            rowIndex: Math.floor(idx / 7),
        });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const d = new Date(year, month, day);
        const idx = items.length;
        items.push({
            date: d,
            isCurrentMonth: true,
            colIndex: idx % 7,
            rowIndex: Math.floor(idx / 7),
        });
    }

    // Next month head to complete standard weeks
    const remaining = (7 - (items.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
        const d = new Date(year, month + 1, day);
        const idx = items.length;
        items.push({
            date: d,
            isCurrentMonth: false,
            colIndex: idx % 7,
            rowIndex: Math.floor(idx / 7),
        });
    }

    return items;
}

// ─── Format Range ─────────────────────────────────────────────────────────────

const formatDateRange = (start?: string, end?: string) => {
    const s = parseDate(start);
    const e = parseDate(end);
    if (!s) return "—";
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return e && s.getTime() !== e.getTime()
        ? `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`
        : s.toLocaleDateString("en-US", { ...opts, year: "numeric" });
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
    return (
        <div className="animate-pulse p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-44 bg-muted/60 rounded-xl" />
                <div className="flex gap-2">
                    <div className="h-9 w-9 bg-muted/60 rounded-lg" />
                    <div className="h-9 w-16 bg-muted/60 rounded-lg" />
                    <div className="h-9 w-9 bg-muted/60 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-muted/20 rounded-xl overflow-hidden border border-border/40">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted/40" />
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted/20" />
                ))}
            </div>
        </div>
    );
}

// ─── Trip Details Modal / Card Content ─────────────────────────────────────────

function TripDetailsContent({
    trip,
    onViewDetails,
}: {
    trip: TripResponse;
    onViewDetails: (trip: TripResponse) => void;
}) {
    const cfg = getStatusConfig(trip.status);
    const bookingId = `BK${String(trip.id).padStart(5, "0")}`;

    return (
        <div className="p-3.5 space-y-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card transition-colors">
            <div className="flex gap-3 items-start">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border/60">
                    <img
                        src={trip.imageUrl || placeholderImg}
                        alt={trip.packageName || "Trip"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = placeholderImg;
                        }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
                        {trip.packageName ?? trip.destination ?? "Travel Package"}
                    </p>
                    {(trip.district || trip.destination) && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                            <span className="truncate">{trip.district || trip.destination}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-mono">
                        <Hash className="h-3 w-3" />
                        <span>{bookingId}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <Badge
                    variant="outline"
                    className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cfg.badge)}
                >
                    <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", cfg.dot)} />
                    {cfg.label}
                </Badge>
                {trip.paymentStatus && (
                    <Badge
                        variant="outline"
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted/60 text-foreground border-border"
                    >
                        <CreditCard className="h-3 w-3 mr-1 text-muted-foreground" />
                        {trip.paymentStatus}
                    </Badge>
                )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                    <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                </div>
            </div>

            <Button
                size="sm"
                className="w-full h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm gap-1.5 mt-1"
                onClick={() => onViewDetails(trip)}
            >
                <Eye className="h-3.5 w-3.5" />
                View Booking Details
            </Button>
        </div>
    );
}

// ─── Desktop Smart Edge-Aware Popup ───────────────────────────────────────────

function DesktopBookingPopup({
    trips,
    date,
    colIndex,
    rowIndex,
    onClose,
    onViewDetails,
}: {
    trips: TripResponse[];
    date: Date;
    colIndex: number;
    rowIndex: number;
    onClose: () => void;
    onViewDetails: (trip: TripResponse) => void;
}) {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    // Format header date
    const displayDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    // Smart horizontal alignment:
    // Left edge columns (0, 1) -> align left
    // Right edge columns (5, 6) -> align right
    // Middle columns -> center
    const horizontalClasses =
        colIndex >= 4
            ? "right-0"
            : colIndex <= 2
            ? "left-0"
            : "left-1/2 -translate-x-1/2";

    // Smart vertical positioning:
    // Bottom rows (rowIndex >= 3) -> flip upwards above cell
    const verticalClasses =
        rowIndex >= 3 ? "bottom-full mb-2.5" : "top-full mt-2.5";

    return (
        <div
            ref={popupRef}
            className={cn(
                "absolute z-50 w-84 bg-popover/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl",
                "animate-in fade-in zoom-in-95 duration-200",
                horizontalClasses,
                verticalClasses
            )}
            style={{
                boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">{displayDate}</p>
                        <p className="text-[11px] text-muted-foreground">
                            {trips.length} active schedule{trips.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Close popup"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* List */}
            <div className="max-h-84 overflow-y-auto p-3 space-y-2.5">
                {trips.map((trip) => (
                    <TripDetailsContent
                        key={trip.id}
                        trip={trip}
                        onViewDetails={(t) => {
                            onViewDetails(t);
                            onClose();
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Mobile Bottom Sheet ───────────────────────────────────────────────────────

function MobileBookingBottomSheet({
    trips,
    date,
    onClose,
    onViewDetails,
}: {
    trips: TripResponse[];
    date: Date;
    onClose: () => void;
    onViewDetails: (trip: TripResponse) => void;
}) {
    const displayDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Backdrop click to dismiss */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Sliding Drawer Container */}
            <div
                className={cn(
                    "relative z-10 w-full max-h-[85vh] bg-background border-t border-border/80 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col",
                    "animate-in slide-in-from-bottom duration-300"
                )}
            >
                {/* Drag handle bar */}
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto my-3" />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 border-b border-border/60">
                    <div>
                        <h3 className="text-base font-bold text-foreground">{displayDate}</h3>
                        <p className="text-xs text-muted-foreground">
                            {trips.length} booking{trips.length > 1 ? "s" : ""} on this day
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-4 overflow-y-auto space-y-3 pb-8">
                    {trips.map((trip) => (
                        <TripDetailsContent
                            key={trip.id}
                            trip={trip}
                            onViewDetails={(t) => {
                                onViewDetails(t);
                                onClose();
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main BookingCalendar Component ───────────────────────────────────────────

export function BookingCalendar({ trips, isLoading, onOpenTripDetails }: BookingCalendarProps) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    // Selected cell for popup
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [popupTrips, setPopupTrips] = useState<TripResponse[]>([]);
    const [popupDate, setPopupDate] = useState<Date | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ colIndex: number; rowIndex: number }>({
        colIndex: 0,
        rowIndex: 0,
    });

    // Mobile viewport detector
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Month caching map for fast instant navigation
    const tripsByDate = useMemo(() => {
        const map = new Map<string, TripResponse[]>();
        trips.forEach((trip) => {
            const start = parseDate(trip.startDate);
            const end = parseDate(trip.endDate);
            if (!start || !end) return;

            const cur = new Date(start);
            while (cur <= end) {
                const key = toDateKey(cur);
                if (!map.has(key)) map.set(key, []);
                map.get(key)!.push(trip);
                cur.setDate(cur.getDate() + 1);
            }
        });
        return map;
    }, [trips]);

    // Build the grid
    const calendarGrid = useMemo(
        () => buildFullCalendarGrid(viewYear, viewMonth),
        [viewYear, viewMonth]
    );

    // Month navigation
    const goToPrevMonth = useCallback(() => {
        setSelectedKey(null);
        setViewMonth((m) => {
            if (m === 0) {
                setViewYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    }, []);

    const goToNextMonth = useCallback(() => {
        setSelectedKey(null);
        setViewMonth((m) => {
            if (m === 11) {
                setViewYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    }, []);

    const goToToday = useCallback(() => {
        setSelectedKey(null);
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
    }, [today]);

    // Cell click handler
    const handleCellClick = useCallback(
        (item: CalendarDateItem, dayTrips: TripResponse[]) => {
            const key = toDateKey(item.date);
            if (selectedKey === key) {
                setSelectedKey(null);
            } else {
                setSelectedKey(key);
                setPopupTrips(dayTrips);
                setPopupDate(item.date);
                setPopupPosition({ colIndex: item.colIndex, rowIndex: item.rowIndex });
            }
        },
        [selectedKey]
    );

    const closePopup = useCallback(() => {
        setSelectedKey(null);
        setPopupDate(null);
    }, []);

    // Active bookings in currently viewed month
    const monthStart = useMemo(() => new Date(viewYear, viewMonth, 1), [viewYear, viewMonth]);
    const monthEnd = useMemo(() => new Date(viewYear, viewMonth + 1, 0), [viewYear, viewMonth]);
    const activeMonthTrips = useMemo(() => {
        return trips.filter((trip) => {
            const s = parseDate(trip.startDate);
            const e = parseDate(trip.endDate);
            if (!s || !e) return false;
            return s <= monthEnd && e >= monthStart;
        });
    }, [trips, monthStart, monthEnd]);

    const todayKey = useMemo(() => toDateKey(today), [today]);

    return (
        <div className="w-full space-y-4">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                Booking Calendar
                            </h2>
                            {activeMonthTrips.length > 0 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full font-semibold">
                                    {activeMonthTrips.length} active
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Your interactive travel itinerary &amp; schedule
                        </p>
                    </div>
                </div>

                {/* Legend pill tags */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
                            <span className="text-[11px] font-medium">{cfg.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar Card Container */}
            <div
                className="rounded-3xl border border-border/70 bg-card shadow-soft overflow-hidden transition-all duration-300"
                style={{
                    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
                }}
            >
                {isLoading ? (
                    <CalendarSkeleton />
                ) : (
                    <>
                        {/* Calendar Top Controls Bar */}
                        <div className="px-4 sm:px-6 py-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                                    {MONTH_NAMES[viewMonth]} {viewYear}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {activeMonthTrips.length > 0
                                        ? `${activeMonthTrips.length} scheduled trip${activeMonthTrips.length > 1 ? "s" : ""} this month`
                                        : "No bookings for this month"}
                                </p>
                            </div>

                            {/* Month Nav Buttons */}
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToToday}
                                    className="h-8 px-3 text-xs font-semibold rounded-xl border-border/80 hover:bg-muted/80 shadow-xs"
                                >
                                    Today
                                </Button>
                                <div className="flex items-center rounded-xl border border-border/80 bg-background/80 p-0.5 shadow-xs">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={goToPrevMonth}
                                        className="h-7 w-7 rounded-lg hover:bg-muted"
                                        aria-label="Previous Month"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={goToNextMonth}
                                        className="h-7 w-7 rounded-lg hover:bg-muted"
                                        aria-label="Next Month"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid with Continuous Lines */}
                        <div className="p-3 sm:p-5">
                            {/* Days of Week Row */}
                            <div className="grid grid-cols-7 mb-1 bg-muted/30 rounded-xl border border-border/40 py-2">
                                {DAYS_OF_WEEK.map((d, i) => (
                                    <div
                                        key={d}
                                        className={cn(
                                            "text-center text-[11px] sm:text-xs font-bold uppercase tracking-wider",
                                            i === 0 || i === 6
                                                ? "text-muted-foreground/70"
                                                : "text-foreground/80"
                                        )}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Main Grid: Google Calendar / Notion Calendar style bordered cells */}
                            <div className="grid grid-cols-7 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/80">
                                {calendarGrid.map((item, idx) => {
                                    const key = toDateKey(item.date);
                                    const dayTrips = tripsByDate.get(key) ?? [];
                                    const isToday = key === todayKey;
                                    const isSelected = selectedKey === key;
                                    const hasBookings = dayTrips.length > 0;

                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "relative flex flex-col justify-between p-1 sm:p-2 min-h-[70px] sm:min-h-[100px] transition-colors",
                                                item.isCurrentMonth
                                                    ? "bg-card hover:bg-muted/30"
                                                    : "bg-muted/15 text-muted-foreground/40",
                                                isToday && "bg-primary/[0.04]",
                                                isSelected && "ring-2 ring-primary ring-inset z-20"
                                            )}
                                        >
                                            {/* Cell Header: Day Number */}
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={cn(
                                                        "text-xs sm:text-sm font-semibold inline-flex items-center justify-center rounded-full transition-all",
                                                        isToday
                                                            ? "w-6 h-6 sm:w-7 sm:h-7 bg-primary text-white font-bold shadow-xs shadow-primary/40 ring-2 ring-primary/20"
                                                            : item.isCurrentMonth
                                                            ? "text-foreground w-6 h-6"
                                                            : "text-muted-foreground/40 w-6 h-6"
                                                    )}
                                                >
                                                    {item.date.getDate()}
                                                </span>

                                                {/* On mobile: compact indicator chip */}
                                                {hasBookings && (
                                                    <span className="sm:hidden text-[10px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                                                        {dayTrips.length}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Booking Indicators: Desktop Badges / Status Pills */}
                                            <div className="mt-1 space-y-1 overflow-hidden">
                                                {/* Desktop pills (up to 2) */}
                                                <div className="hidden sm:flex flex-col gap-1">
                                                    {dayTrips.slice(0, 2).map((trip, tripIdx) => {
                                                        const cfg = getStatusConfig(trip.status);
                                                        return (
                                                            <button
                                                                key={tripIdx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCellClick(item, dayTrips);
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left px-2 py-0.5 rounded-md border text-[11px] font-medium leading-tight",
                                                                    "flex items-center gap-1.5 truncate shadow-2xs transition-all hover:scale-[1.02] cursor-pointer",
                                                                    cfg.pill
                                                                )}
                                                                title={`${trip.packageName || trip.destination} (${cfg.label})`}
                                                            >
                                                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                                                                <span className="truncate">
                                                                    {trip.packageName || trip.destination || cfg.label}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}

                                                    {/* +N more chip */}
                                                    {dayTrips.length > 2 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCellClick(item, dayTrips);
                                                            }}
                                                            className="text-left text-[10px] font-semibold text-primary hover:underline px-1"
                                                        >
                                                            +{dayTrips.length - 2} more
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Mobile compact color dots row */}
                                                <div className="sm:hidden flex items-center gap-0.5 justify-center mt-1">
                                                    {dayTrips.slice(0, 3).map((trip, i) => (
                                                        <span
                                                            key={i}
                                                            className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                getStatusConfig(trip.status).dot
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Entire cell is clickable if it has bookings */}
                                            {hasBookings && (
                                                <button
                                                    onClick={() => handleCellClick(item, dayTrips)}
                                                    className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary rounded-none z-10"
                                                    aria-label={`View bookings for ${item.date.toDateString()}`}
                                                />
                                            )}

                                            {/* Desktop Popup (Only rendered on desktop viewports) */}
                                            {!isMobile && isSelected && popupDate && (
                                                <div className="relative z-50">
                                                    <DesktopBookingPopup
                                                        trips={popupTrips}
                                                        date={popupDate}
                                                        colIndex={popupPosition.colIndex}
                                                        rowIndex={popupPosition.rowIndex}
                                                        onClose={closePopup}
                                                        onViewDetails={onOpenTripDetails}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Bottom Sheet (Rendered when isMobile and a date is selected) */}
                        {isMobile && selectedKey && popupDate && (
                            <MobileBookingBottomSheet
                                trips={popupTrips}
                                date={popupDate}
                                onClose={closePopup}
                                onViewDetails={onOpenTripDetails}
                            />
                        )}

                        {/* Clean Empty State */}
                        {trips.length === 0 && (
                            <div className="px-6 py-10 text-center">
                                <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3 text-muted-foreground/60">
                                    <CalendarDays className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-semibold text-foreground">No bookings recorded yet</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    Browse packages and book your next dream holiday to see your schedule organized here.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
