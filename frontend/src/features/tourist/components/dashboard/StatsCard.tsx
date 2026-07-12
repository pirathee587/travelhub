import { cn } from "@/features/tourist/services/utils";

const variantStyles = {
    default: "bg-card border border-border",
    primary: "gradient-ocean text-primary-foreground border-none",
    accent: "gradient-sunset text-accent-foreground border-none",
    success: "bg-emerald-50 border-emerald-100 text-emerald-900",
    blue: "bg-blue-50 border-blue-100 text-blue-900",
    green: "bg-emerald-50 border-emerald-100 text-emerald-900",
    orange: "bg-orange-50 border-orange-100 text-orange-900",
    purple: "bg-purple-50 border-purple-100 text-purple-900",
};

const iconVariantStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    accent: "bg-accent-foreground/20 text-accent-foreground",
    success: "bg-emerald-500/50 text-emerald-600",
    blue: "bg-blue-500/20 text-blue-600",
    green: "bg-emerald-500/20 text-emerald-600",
    orange: "bg-orange-500/20 text-orange-600",
    purple: "bg-purple-500/20 text-purple-600",
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
