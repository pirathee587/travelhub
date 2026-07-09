import { cn } from "@/utils/utils";

/**
 * Reusable skeleton shimmer components for perceived performance.
 * Uses CSS shimmer animation (left-to-right gradient sweep) instead of
 * basic animate-pulse for a more premium loading experience.
 */

// ─── Base Shimmer Atom ───────────────────────────────────────────────────────

export function Shimmer({ className }) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl bg-[#E2E8F0]",
                "before:absolute before:inset-0",
                "before:bg-gradient-to-r before:from-transparent before:via-[#F1F5F9]/80 before:to-transparent",
                "before:animate-shimmer",
                className
            )}
        />
    );
}

// ─── Travel Card Skeleton ────────────────────────────────────────────────────

export function CardSkeleton({ showHotelHeader = false }) {
    return (
        <div className={cn(
            "flex flex-col overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] shadow-sm",
            showHotelHeader ? "h-[265px]" : "h-[350px]"
        )}>
            {/* Image area */}
            <Shimmer className={cn("rounded-none rounded-t-2xl flex-shrink-0", showHotelHeader ? "h-32" : "h-48")} />

            {/* Content area */}
            <div className="flex flex-col flex-1 p-4 gap-3">
                <Shimmer className="h-5 w-3/4" />
                <Shimmer className="h-4 w-1/2" />
                <div className="mt-auto pt-3 border-t border-[#E2E8F0] flex justify-between items-center">
                    <Shimmer className="h-6 w-24" />
                    <Shimmer className="h-8 w-20 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/** Grid of card skeletons */
export function CardGridSkeleton({ count = 5, showHotelHeader = false }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} showHotelHeader={showHotelHeader} />
            ))}
        </>
    );
}

// ─── Stats Card Skeleton ─────────────────────────────────────────────────────

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
                    <div className="flex items-center gap-4">
                        <Shimmer className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Shimmer className="h-4 w-24" />
                            <Shimmer className="h-8 w-16" />
                        </div>
                    </div>
                    <Shimmer className="h-3 w-32" />
                </div>
            ))}
        </div>
    );
}

// ─── Recommendation Row Skeleton ─────────────────────────────────────────────

export function RecommendationSkeleton({ count = 4 }) {
    return (
        <div className="flex gap-6 overflow-hidden pb-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="w-72 flex-shrink-0">
                    <CardSkeleton />
                </div>
            ))}
        </div>
    );
}

// ─── Hero Section Skeleton ───────────────────────────────────────────────────

export function HeroSkeleton() {
    return (
        <div className="relative rounded-3xl overflow-hidden h-[380px] bg-[#E2E8F0]">
            <Shimmer className="absolute inset-0 rounded-none" />
            <div className="relative p-8 lg:p-20 flex flex-col items-center gap-6 pt-16">
                <Shimmer className="h-6 w-40 rounded-full" />
                <Shimmer className="h-12 w-3/4 max-w-xl" />
                <Shimmer className="h-4 w-1/2 max-w-md" />
                <Shimmer className="h-14 w-full max-w-2xl rounded-2xl mt-4" />
            </div>
        </div>
    );
}

// ─── Page Header Skeleton ────────────────────────────────────────────────────

export function PageHeaderSkeleton() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
                <Shimmer className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                    <Shimmer className="h-8 w-48" />
                    <Shimmer className="h-4 w-64" />
                </div>
            </div>
            <Shimmer className="h-10 w-36 rounded-xl" />
        </div>
    );
}

// ─── Trip Card Skeleton ───────────────────────────────────────────────────────

export function TripCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row">
                <Shimmer className="h-40 sm:h-auto sm:w-48 rounded-none rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none flex-shrink-0" />
                <div className="flex flex-col flex-1 p-5 gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <Shimmer className="h-4 w-20 rounded-full" />
                            <Shimmer className="h-6 w-3/4" />
                            <Shimmer className="h-4 w-1/2" />
                        </div>
                        <Shimmer className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-auto">
                        <Shimmer className="h-8 w-28 rounded-lg" />
                        <Shimmer className="h-8 w-28 rounded-lg" />
                        <Shimmer className="h-8 w-28 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TripListSkeleton({ count = 3 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <TripCardSkeleton key={i} />
            ))}
        </div>
    );
}

// ─── Document Card Skeleton ───────────────────────────────────────────────────

export function DocumentCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 flex items-center gap-4">
            <Shimmer className="h-12 w-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
                <Shimmer className="h-5 w-3/4" />
                <Shimmer className="h-4 w-1/2" />
            </div>
            <Shimmer className="h-9 w-20 rounded-lg flex-shrink-0" />
        </div>
    );
}

export function DocumentListSkeleton({ count = 4 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <DocumentCardSkeleton key={i} />
            ))}
        </div>
    );
}

// ─── Documents Page Stats Skeleton ───────────────────────────────────────────

export function DocumentsStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm flex items-center gap-4">
                    <Shimmer className="h-12 w-12 rounded-xl flex-shrink-0" />
                    <div className="space-y-2">
                        <Shimmer className="h-8 w-12" />
                        <Shimmer className="h-4 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Filter Bar Skeleton ─────────────────────────────────────────────────────

export function FilterBarSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 bg-white/40 p-2 rounded-2xl border border-[#E2E8F0] flex gap-2 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Shimmer key={i} className="h-11 w-24 rounded-xl flex-shrink-0" />
                ))}
            </div>
            <div className="flex gap-3">
                <Shimmer className="h-11 w-44 rounded-xl" />
                <Shimmer className="h-11 w-44 rounded-xl" />
            </div>
        </div>
    );
}

// ─── Package Detail Skeleton ─────────────────────────────────────────────────

export function DetailSkeleton() {
    return (
        <div className="space-y-8 max-w-[1440px] mx-auto pb-10">
            {/* Back button */}
            <Shimmer className="h-9 w-32 rounded-xl" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-3 flex-1">
                    <Shimmer className="h-6 w-24 rounded-full" />
                    <Shimmer className="h-10 w-80" />
                    <Shimmer className="h-5 w-56" />
                </div>
                <div className="space-y-3">
                    <Shimmer className="h-4 w-28 ml-auto" />
                    <Shimmer className="h-10 w-36 ml-auto rounded-xl" />
                    <Shimmer className="h-11 w-40 ml-auto rounded-xl" />
                </div>
            </div>

            {/* Image gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 h-[440px]">
                <Shimmer className="rounded-2xl h-full" />
                <div className="grid grid-rows-2 gap-4">
                    <Shimmer className="rounded-2xl" />
                    <Shimmer className="rounded-2xl" />
                </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] space-y-3">
                        <Shimmer className="h-8 w-8 rounded-lg" />
                        <Shimmer className="h-6 w-20" />
                        <Shimmer className="h-4 w-24" />
                    </div>
                ))}
            </div>

            {/* Content sections */}
            <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] space-y-4">
                        <Shimmer className="h-6 w-40" />
                        <div className="space-y-2">
                            <Shimmer className="h-4 w-full" />
                            <Shimmer className="h-4 w-5/6" />
                            <Shimmer className="h-4 w-4/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Booking / Reservation Form Skeleton ─────────────────────────────────────

export function ReservationSkeleton() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16">
            {/* Back + title */}
            <div className="space-y-3">
                <Shimmer className="h-9 w-32 rounded-xl" />
                <Shimmer className="h-8 w-64" />
                <Shimmer className="h-4 w-48" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section card */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
                            <Shimmer className="h-6 w-40" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <div key={j} className="space-y-2">
                                        <Shimmer className="h-4 w-24" />
                                        <Shimmer className="h-11 w-full rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary panel */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
                        <Shimmer className="h-6 w-32" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <Shimmer className="h-4 w-24" />
                                    <Shimmer className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                        <Shimmer className="h-px w-full rounded-full" />
                        <div className="flex justify-between">
                            <Shimmer className="h-6 w-16" />
                            <Shimmer className="h-6 w-24" />
                        </div>
                        <Shimmer className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Hotel Details Skeleton ──────────────────────────────────────────────────

export function HotelDetailSkeleton() {
    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-16">
            <Shimmer className="h-9 w-32 rounded-xl" />

            {/* Hero image */}
            <Shimmer className="h-72 w-full rounded-2xl" />

            {/* Title + rating row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                    <Shimmer className="h-8 w-72" />
                    <Shimmer className="h-5 w-48" />
                    <div className="flex gap-2">
                        <Shimmer className="h-6 w-20 rounded-full" />
                        <Shimmer className="h-6 w-20 rounded-full" />
                    </div>
                </div>
                <Shimmer className="h-12 w-40 rounded-xl" />
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] space-y-3">
                        <Shimmer className="h-8 w-8 rounded-lg" />
                        <Shimmer className="h-5 w-20" />
                        <Shimmer className="h-4 w-16" />
                    </div>
                ))}
            </div>

            {/* Reviews section */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
                <Shimmer className="h-6 w-40" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 pb-4 border-b border-[#E2E8F0] last:border-0">
                        <Shimmer className="h-10 w-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Shimmer className="h-4 w-32" />
                            <Shimmer className="h-4 w-full" />
                            <Shimmer className="h-4 w-4/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── My Trips Page Skeleton ──────────────────────────────────────────────────

export function MyTripsSkeleton() {
    return (
        <div className="space-y-8">
            <PageHeaderSkeleton />
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] flex items-center gap-4">
                        <Shimmer className="h-12 w-12 rounded-xl flex-shrink-0" />
                        <div className="space-y-2">
                            <Shimmer className="h-8 w-12" />
                            <Shimmer className="h-4 w-20" />
                        </div>
                    </div>
                ))}
            </div>
            <TripListSkeleton count={3} />
        </div>
    );
}

// ─── Documents Page Skeleton ─────────────────────────────────────────────────

export function DocumentsPageSkeleton() {
    return (
        <div className="space-y-8">
            <PageHeaderSkeleton />
            <DocumentsStatsSkeleton />
            <DocumentListSkeleton count={5} />
        </div>
    );
}

// ─── Overview Page Skeleton ──────────────────────────────────────────────────

export function OverviewSkeleton() {
    return (
        <div className="space-y-8">
            <PageHeaderSkeleton />
            <StatsSkeleton />
            <TripListSkeleton count={2} />
            <DocumentListSkeleton count={3} />
        </div>
    );
}
