import { cn } from "@/lib/utils";

const variantStyles = {
    default: "bg-card border border-border",
    primary: "gradient-ocean text-primary-foreground",
    accent: "gradient-sunset text-accent-foreground",
    success: "bg-success text-success-foreground",
};

const iconVariantStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    accent: "bg-accent-foreground/20 text-accent-foreground",
    success: "bg-success-foreground/20 text-success-foreground",
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
                "relative overflow-hidden rounded-xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1",
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
