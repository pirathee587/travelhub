import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | Date): string {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
            // Handle YYYY-MM-DD string parsing safely without timezone shift
            const parts = String(dateStr).split(/[- /]/);
            if (parts.length >= 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);
                const parsed = new Date(year, month, day);
                return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }
            return String(dateStr);
        }
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
        return String(dateStr);
    }
}

export function formatDateRange(startDateStr?: string, endDateStr?: string): string {
    if (!startDateStr && !endDateStr) return "";
    if (startDateStr && !endDateStr) return `From ${formatDate(startDateStr)}`;
    if (!startDateStr && endDateStr) return `To ${formatDate(endDateStr)}`;
    return `From ${formatDate(startDateStr)} To ${formatDate(endDateStr)}`;
}

export function formatDateTime(dateTimeStr?: string | Date): string {
    if (!dateTimeStr) return "";
    try {
        const rawStr = String(dateTimeStr).trim();
        // Check if rawStr is like "2026-08-18 16:23"
        const spaceSplit = rawStr.split(" ");
        let d: Date;
        if (spaceSplit.length === 2 && spaceSplit[0].includes("-") && spaceSplit[1].includes(":")) {
            const [datePart, timePart] = spaceSplit;
            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minute] = timePart.split(":").map(Number);
            d = new Date(year, month - 1, day, hour, minute);
        } else {
            d = new Date(dateTimeStr);
        }

        if (isNaN(d.getTime())) return rawStr;

        const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const timeFormatted = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

        return `${dateFormatted} at ${timeFormatted}`;
    } catch {
        return String(dateTimeStr);
    }
}

export function RenderDateRange({ startDateStr, endDateStr, className = "" }: { startDateStr?: string; endDateStr?: string; className?: string }) {
    if (!startDateStr && !endDateStr) return null;
    const startFormatted = formatDate(startDateStr);
    const endFormatted = formatDate(endDateStr);

    return (
        <span className={cn("inline-flex items-center gap-1 flex-wrap text-sm", className)}>
            {startFormatted && (
                <>
                    <span className="text-[11px] font-normal opacity-70 lowercase tracking-tight">from</span>
                    <span className="font-semibold">{startFormatted}</span>
                </>
            )}
            {endFormatted && (
                <>
                    <span className="text-[11px] font-normal opacity-70 lowercase tracking-tight ml-0.5">to</span>
                    <span className="font-semibold">{endFormatted}</span>
                </>
            )}
        </span>
    );
}

export function RenderDateTime({ dateTimeStr, className = "" }: { dateTimeStr?: string | Date; className?: string }) {
    if (!dateTimeStr) return null;
    const rawStr = String(dateTimeStr).trim();
    const spaceSplit = rawStr.split(" ");
    let d: Date;
    if (spaceSplit.length === 2 && spaceSplit[0].includes("-") && spaceSplit[1].includes(":")) {
        const [datePart, timePart] = spaceSplit;
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        d = new Date(year, month - 1, day, hour, minute);
    } else {
        d = new Date(dateTimeStr);
    }

    if (isNaN(d.getTime())) return <span className={className}>{rawStr}</span>;

    const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeFormatted = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    return (
        <span className={cn("inline-flex items-center gap-1 flex-wrap text-sm", className)}>
            <span className="font-semibold">{dateFormatted}</span>
            <span className="text-[11px] font-normal opacity-70 lowercase">at</span>
            <span className="font-semibold">{timeFormatted}</span>
        </span>
    );
}
