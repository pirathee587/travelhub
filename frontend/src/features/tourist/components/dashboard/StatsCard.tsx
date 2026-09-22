import { cn } from "@/features/tourist/services/utils";

const variantStyles: Record<string, string> = {
    default: "bg-card border border-border/70 text-card-foreground shadow-soft",
    primary: "gradient-ocean text-primary-foreground border-none shadow-glow",
    accent: "gradient-sunset text-accent-foreground border-none shadow-soft",
    success:
        "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-card border border-emerald-500/20 text-card-foreground shadow-soft",
    blue: "bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-card border border-blue-500/20 text-card-foreground shadow-soft",
    green: "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-card border border-emerald-500/20 text-card-foreground shadow-soft",
    orange: "bg-orange-500/10 via-amber-500/5 to-card border border-orange-500/20 text-card-foreground shadow-soft",
    purple: "bg-purple-500/10 via-indigo-500/5 to-card border border-purple-500/20 text-card-foreground shadow-soft",
};

const iconVariantStyles: Record<string, string> = {
    default: "bg-primary/10 text-primary border border-primary/20",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    accent: "bg-accent-foreground/20 text-accent-foreground",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    orange: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20",
    purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20",
};

export function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = "default",
    className,
}: {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: any;
    trend?: { isPositive: boolean; value: number };
    variant?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 group",
                variantStyles[variant] || variantStyles.default,
                className
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {title}
                    </p>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <p
                            className={cn(
                                "text-xs font-medium pt-1",
                                trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                            )}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        "rounded-2xl p-3 shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs",
                        iconVariantStyles[variant] || iconVariantStyles.default
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {/* Subtle decorative glow orb */}
            <div
                className={cn(
                    "absolute -right-6 -bottom-6 h-28 w-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-30",
                    variant === "blue" && "bg-blue-500",
                    variant === "green" && "bg-emerald-500",
                    variant === "orange" && "bg-orange-500",
                    variant === "purple" && "bg-purple-500",
                    variant === "default" && "bg-primary"
                )}
            />
        </div>
    );
}
