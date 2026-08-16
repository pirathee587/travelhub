import { cn } from "@/features/tourist/services/utils";

const variantStyles = {
    default: "bg-card border border-border",
    primary: "gradient-ocean text-primary-foreground border-none",
    accent: "gradient-sunset text-accent-foreground border-none",
    success: "bg-emerald-100 border-emerald-200 text-emerald-950",
    blue: "bg-blue-100 border-blue-200 text-blue-950",
    green: "bg-emerald-100 border-emerald-200 text-emerald-950",
    orange: "bg-orange-100 border-orange-200 text-orange-950",
    purple: "bg-purple-100 border-purple-200 text-purple-950",
};

const iconVariantStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    accent: "bg-accent-foreground/20 text-accent-foreground",
    success: "bg-emerald-500/30 text-emerald-800",
    blue: "bg-blue-500/30 text-blue-800",
    green: "bg-emerald-500/30 text-emerald-800",
    orange: "bg-orange-500/30 text-orange-800",
    purple: "bg-purple-500/30 text-purple-800",
};

export function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = "default",
    className,
}) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl p-6 shadow-soft border border-border/50 transition-all duration-500 hover:shadow-elevated hover:-translate-y-1",
                variantStyles[variant],
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p
                        className={cn(
                            "text-sm font-medium",
                            variant === "default" ? "text-muted-foreground" : "opacity-90"
                        )}
                    >
                        {title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {subtitle && (
                        <p
                            className={cn(
                                "text-sm",
                                variant === "default" ? "text-muted-foreground" : "opacity-80"
                            )}
                        >
                            {subtitle}
                        </p>
                    )}
                {trend && (
                        <p
                            className={cn(
                                "text-sm font-medium",
                                trend.isPositive ? "text-success" : "text-destructive"
                            )}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        "rounded-lg p-3",
                        iconVariantStyles[variant]
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {/* Decorative element */}
            <div
                className={cn(
                    "absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-10",
                    variant === "default" ? "bg-primary" : "bg-current"
                )}
            />
        </div>
    );
}
