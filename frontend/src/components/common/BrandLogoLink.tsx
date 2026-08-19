import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { cn } from '@/features/tourist/services/utils';

type BrandLogoLinkProps = {
  variant?: 'hero' | 'image' | 'sidebar' | 'header';
  collapsed?: boolean;
  className?: string;
};

export function BrandLogoLink({
  variant = 'hero',
  collapsed = false,
  className,
}: BrandLogoLinkProps) {
  if (variant === 'image') {
    return (
      <Link
        to="/"
        aria-label="TravelHub home"
        className={cn('inline-flex justify-center hover:opacity-90 transition-opacity', className)}
      >
        <img
          src="/TravelHUB.png"
          alt="TravelHub"
          className="h-12 w-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </Link>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Link
        to="/"
        aria-label="TravelHub home"
        className={cn(
          'p-4 flex items-center gap-3 transition-all duration-300 hover:opacity-90',
          collapsed && 'justify-center px-2 py-4',
          className,
        )}
      >
        <div
          className={cn(
            'rounded-xl bg-primary flex items-center justify-center shadow-glow transition-all duration-300',
            collapsed ? 'h-10 w-10' : 'h-12 w-12',
          )}
        >
          <Plane className={cn('text-white transition-all duration-300', collapsed ? 'h-5 w-5' : 'h-7 w-7')} />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-lg text-sidebar-foreground">TravelHub</h1>
            <p className="text-xs text-sidebar-foreground/60">Dashboard</p>
          </div>
        )}
      </Link>
    );
  }

  if (variant === 'header') {
    return (
      <Link
        to="/"
        aria-label="TravelHub home"
        className={cn('inline-flex items-center gap-2 hover:opacity-90 transition-opacity', className)}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-800 font-display">TravelHub</span>
      </Link>
    );
  }

  return (
    <Link
      to="/"
      aria-label="TravelHub home"
      className={cn('flex items-center gap-2 hover:opacity-90 transition-opacity', className)}
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
        <Plane className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold tracking-tight text-white font-display">TravelHub</span>
    </Link>
  );
}
