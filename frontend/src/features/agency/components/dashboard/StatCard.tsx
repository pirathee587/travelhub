import { cn } from '@/utils/utils';

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) {
  const variants = {
    default: 'stat-card',
    primary: 'stat-card stat-card-primary',
    success: 'stat-card stat-card-success',
    accent: 'stat-card stat-card-accent',
  };

  const iconBg = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    success: 'bg-success-foreground/20 text-success-foreground',
    accent: 'bg-accent-foreground/20 text-accent-foreground',
  };

  return (
    <div className={cn(variants[variant], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
            )}
          >
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive
                  ? variant === 'default'
                    ? 'text-success'
                    : 'opacity-90'
                  : variant === 'default'
                    ? 'text-destructive'
                    : 'opacity-90'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              <span className="opacity-70">vs last month</span>
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconBg[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
