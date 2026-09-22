import { useState, useCallback, useRef, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    X,
    MapPin,
    CreditCard,
    Hash,
    ArrowRight,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { cn } from "@/features/tourist/services/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripResponse {
    id: number;
    packageId?: number;
    packageName?: string;
    destination?: string;
    startDate?: string; // "YYYY-MM-DD"
    endDate?: string;   // "YYYY-MM-DD"
    status?: string;
    paymentStatus?: string;
    district?: string;
}

interface BookingCalendarProps {
    trips: TripResponse[];
    isLoading: boolean;
    onOpenTripDetails: (trip: TripResponse) => void;
}

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; ring: string }> = {
    pending: {
        label: "Pending",
        dot: "bg-amber-400",
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        ring: "ring-amber-300",
    },
    confirmed: {
        label: "Confirmed",
        dot: "bg-blue-500",
        badge: "bg-blue-100 text-blue-800 border-blue-300",
        ring: "ring-blue-300",
    },
    paid: {
        label: "Paid",
        dot: "bg-emerald-500",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
        ring: "ring-emerald-300",
    },
    in_progress: {
        label: "In Progress",
        dot: "bg-purple-500",
        badge: "bg-purple-100 text-purple-800 border-purple-300",
        ring: "ring-purple-300",
    },
    completed: {
        label: "Completed",
        dot: "bg-slate-400",
        badge: "bg-slate-100 text-slate-700 border-slate-300",
        ring: "ring-slate-300",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-red-500",
        badge: "bg-red-100 text-red-800 border-red-300",
        ring: "ring-red-300",
    },
};

const getStatusConfig = (status?: string) => {
    const key = status?.toLowerCase() ?? "pending";
    return STATUS_CONFIG[key] ?? STATUS_CONFIG.pending;
};

// ─── Date Helpers ──────────────────────────────────────────────────────────────

const parseDate = (d?: string): Date | null => {
    if (!d) return null;
    // "YYYY-MM-DD" — parse in local timezone without offset shift
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

// ─── Build calendar day grid for a given month ────────────────────────────────

function buildCalendarDays(year: number, month: number): (Date | null)[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay(); // 0=Sun
    const days: (Date | null)[] = [];

    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));

    // pad to complete last week row
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 0; i < remaining; i++) days.push(null);

    return days;
}

// ─── Map trips to date keys ────────────────────────────────────────────────────

function mapTripsToDateKeys(
    trips: TripResponse[]
): Map<string, TripResponse[]> {
    const map = new Map<string, TripResponse[]>();

    trips.forEach((trip) => {
        const start = parseDate(trip.startDate);
        const end = parseDate(trip.endDate);
        if (!start || !end) return;

        // Iterate every day in the range
        const cur = new Date(start);
        while (cur <= end) {
            const key = toDateKey(cur);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(trip);
            cur.setDate(cur.getDate() + 1);
        }
    });

    return map;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-40 bg-muted rounded-lg" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-muted rounded-lg" />
                    <div className="h-8 w-16 bg-muted rounded-lg" />
                    <div className="h-8 w-8 bg-muted rounded-lg" />
                </div>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_OF_WEEK.map((d) => (
                    <div key={d} className="h-6 bg-muted rounded" />
                ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded-xl" />
                ))}
            </div>
        </div>
    );
}

// ─── Booking Popup Card ───────────────────────────────────────────────────────

function BookingPopup({
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
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const formatDisplayDate = (d: Date) =>
        d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const formatDateRange = (start?: string, end?: string) => {
        const s = parseDate(start);
        const e = parseDate(end);
        if (!s) return "—";
        const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
        return e && s.getTime() !== e.getTime()
            ? `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`
            : s.toLocaleDateString("en-US", { ...opts, year: "numeric" });
    };

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 w-80 bg-white border border-border/60 rounded-2xl shadow-2xl",
                "animate-in fade-in slide-in-from-top-2 duration-200",
                // Position: try to center below the cell; overflow handled by parent overflow-visible
                "top-full left-1/2 -translate-x-1/2 mt-2"
            )}
            style={{ boxShadow: "0 20px 60px -10px rgba(0,0,0,0.18)" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                        {formatDisplayDate(date)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        · {trips.length} booking{trips.length > 1 ? "s" : ""}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-lg p-1 hover:bg-muted transition-colors"
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>

            {/* Booking list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
                {trips.map((trip, idx) => {
                    const cfg = getStatusConfig(trip.status);
                    const bookingId = `BK${String(trip.id).padStart(5, "0")}`;
                    return (
                        <div key={idx} className="px-4 py-3 space-y-2.5">
                            {/* Package name */}
                            <div>
                                <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
                                    {trip.packageName ?? "Package"}
                                </p>
                                {trip.district && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{trip.district}</span>
                                    </div>
                                )}
                            </div>

                            {/* Badges row */}
                            <div className="flex flex-wrap gap-1.5">
                                <Badge
                                    variant="outline"
                                    className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", cfg.badge)}
                                >
                                    {cfg.label}
                                </Badge>
                                {trip.paymentStatus && (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border-border"
                                    >
                                        <CreditCard className="h-2.5 w-2.5 mr-1" />
                                        {trip.paymentStatus}
                                    </Badge>
                                )}
                            </div>

                            {/* Date range */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                            </div>

                            {/* Booking ID */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Hash className="h-3 w-3" />
                                <span className="font-mono">{bookingId}</span>
                            </div>

                            {/* CTA */}
                            <Button
                                size="sm"
                                className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white rounded-lg gap-1"
                                onClick={() => {
                                    onViewDetails(trip);
                                    onClose();
                                }}
                            >
                                View Booking Details
                                <ArrowRight className="h-3 w-3" />
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Calendar Day Cell ─────────────────────────────────────────────────────────

function CalendarDayCell({
    date,
    dayTrips,
    isToday,
    isCurrentMonth,
    onCellClick,
    selectedKey,
}: {
    date: Date | null;
    dayTrips: TripResponse[];
    isToday: boolean;
    isCurrentMonth: boolean;
    onCellClick: (date: Date, trips: TripResponse[]) => void;
    selectedKey: string | null;
}) {
    if (!date) {
        return <div className="aspect-square rounded-xl bg-transparent" />;
    }

    const key = toDateKey(date);
    const hasBookings = dayTrips.length > 0;
    const isSelected = selectedKey === key;

    // Show max 3 status dots
    const dots = dayTrips.slice(0, 3);
    const extra = dayTrips.length - 3;

    return (
        <button
            onClick={() => hasBookings && onCellClick(date, dayTrips)}
            disabled={!hasBookings}
            className={cn(
                "relative flex flex-col items-center justify-start rounded-xl transition-all duration-150",
                "min-h-[52px] sm:min-h-[60px] px-0.5 pt-1.5 pb-1",
                "border border-transparent",
                isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                isToday && "bg-primary/8 border-primary/30 font-bold",
                hasBookings && !isSelected && "hover:bg-primary/5 hover:border-primary/20 cursor-pointer",
                hasBookings && isSelected && "bg-primary/10 border-primary/30 ring-2 ring-primary/30",
                !hasBookings && "cursor-default"
            )}
        >
            {/* Day number */}
            <span
                className={cn(
                    "text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-white font-bold text-xs sm:text-sm"
                )}
            >
                {date.getDate()}
            </span>

            {/* Status dots */}
            {hasBookings && (
                <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dots.map((trip, i) => (
                        <span
                            key={i}
                            className={cn(
                                "inline-block rounded-full transition-transform",
                                "w-1.5 h-1.5 sm:w-2 sm:h-2",
                                getStatusConfig(trip.status).dot
                            )}
                        />
                    ))}
                    {extra > 0 && (
                        <span className="text-[9px] text-muted-foreground font-medium leading-none">
                            +{extra}
                        </span>
                    )}
                </div>
            )}
        </button>
    );
}

// ─── Main Calendar Component ───────────────────────────────────────────────────

export function BookingCalendar({ trips, isLoading, onOpenTripDetails }: BookingCalendarProps) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

    // Popup state
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [popupTrips, setPopupTrips] = useState<TripResponse[]>([]);
    const [popupDate, setPopupDate] = useState<Date | null>(null);

    // Build the day grid and the booking map
    const calendarDays = buildCalendarDays(viewYear, viewMonth);
    const tripsByDate = mapTripsToDateKeys(trips);

    // Month navigation
    const goToPrevMonth = useCallback(() => {
        setSelectedKey(null);
        setViewMonth((m) => {
            if (m === 0) { setViewYear((y) => y - 1); return 11; }
            return m - 1;
        });
    }, []);

    const goToNextMonth = useCallback(() => {
        setSelectedKey(null);
        setViewMonth((m) => {
            if (m === 11) { setViewYear((y) => y + 1); return 0; }
            return m + 1;
        });
    }, []);

    const goToToday = useCallback(() => {
        setSelectedKey(null);
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
    }, []);

    const handleCellClick = useCallback((date: Date, dayTrips: TripResponse[]) => {
        const key = toDateKey(date);
        if (selectedKey === key) {
            setSelectedKey(null);
        } else {
            setSelectedKey(key);
            setPopupTrips(dayTrips);
            setPopupDate(date);
        }
    }, [selectedKey]);

    const closePopup = useCallback(() => setSelectedKey(null), []);

    // Count bookings in this month for the subtitle
    const monthStart = new Date(viewYear, viewMonth, 1);
    const monthEnd = new Date(viewYear, viewMonth + 1, 0);
    const monthTrips = trips.filter((trip) => {
        const s = parseDate(trip.startDate);
        const e = parseDate(trip.endDate);
        if (!s || !e) return false;
        return s <= monthEnd && e >= monthStart;
    });

    const todayKey = toDateKey(today);

    return (
        <div className="w-full">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Booking Calendar</h2>
                    <p className="text-muted-foreground text-sm">
                        Visual overview of your travel schedule
                    </p>
                </div>
            </div>

            {/* Card */}
            <div
                className="rounded-2xl border border-border/50 bg-card shadow-soft overflow-hidden"
                style={{ boxShadow: "var(--shadow-card)" }}
            >
                {isLoading ? (
                    <div className="p-6">
                        <CalendarSkeleton />
                    </div>
                ) : (
                    <>
                        {/* Calendar header */}
                        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-border/40">
                            <div className="flex items-center justify-between gap-4">
                                {/* Month + year */}
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                                        {MONTH_NAMES[viewMonth]} {viewYear}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {monthTrips.length > 0
                                            ? `${monthTrips.length} booking${monthTrips.length > 1 ? "s" : ""} this month`
                                            : "No bookings this month"}
                                    </p>
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg border-border hover:bg-muted"
                                        onClick={goToPrevMonth}
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 text-xs font-semibold rounded-lg border-border hover:bg-muted"
                                        onClick={goToToday}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg border-border hover:bg-muted"
                                        onClick={goToNextMonth}
                                        aria-label="Next month"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Status legend */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                    <div key={key} className="flex items-center gap-1.5">
                                        <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", cfg.dot)} />
                                        <span className="text-xs text-muted-foreground">{cfg.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Calendar grid */}
                        <div className="px-3 sm:px-5 pb-5 pt-3">
                            {/* Day-of-week headers */}
                            <div className="grid grid-cols-7 mb-1">
                                {DAYS_OF_WEEK.map((d) => (
                                    <div
                                        key={d}
                                        className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide py-1"
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                                {calendarDays.map((date, idx) => {
                                    const key = date ? toDateKey(date) : null;
                                    const dayTrips = key ? (tripsByDate.get(key) ?? []) : [];
                                    const isToday = key === todayKey;
                                    const isCurrentMonth = date?.getMonth() === viewMonth;

                                    return (
                                        <div key={idx} className="relative">
                                            <CalendarDayCell
                                                date={date}
                                                dayTrips={dayTrips}
                                                isToday={isToday}
                                                isCurrentMonth={isCurrentMonth}
                                                onCellClick={handleCellClick}
                                                selectedKey={selectedKey}
                                            />

                                            {/* Popup — rendered relative to this cell */}
                                            {date && selectedKey === key && popupDate && (
                                                <BookingPopup
                                                    trips={popupTrips}
                                                    date={popupDate}
                                                    onClose={closePopup}
                                                    onViewDetails={onOpenTripDetails}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Empty state */}
                        {trips.length === 0 && (
                            <div className="px-6 pb-8 text-center">
                                <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No bookings yet</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Your bookings will appear here once you make a reservation.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
