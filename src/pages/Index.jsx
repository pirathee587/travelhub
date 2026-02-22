import {
  Package,
  Plane,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BookingsTable } from '@/components/dashboard/BookingsTable';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TripStats } from '@/components/dashboard/TripStats';
import { VehicleDriverQuickView } from '@/components/dashboard/VehicleDriverQuickView';
import { ReviewCard } from '@/components/dashboard/ReviewCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const stats = [
  {
    title: 'Total Packages',
    value: '48',
    icon: Package,
    trend: { value: 12, isPositive: true },
  },
  {
    title: 'Active Trips',
    value: '24',
    icon: Plane,
    trend: { value: 8, isPositive: true },
    variant: 'primary',
  },
  {
    title: 'Completed Trips',
    value: '156',
    icon: CheckCircle,
    trend: { value: 24, isPositive: true },
    variant: 'success',
  },
  {
    title: 'Pending Requests',
    value: '18',
    icon: Clock,
    trend: { value: 5, isPositive: false },
  },
  {
    title: 'Total Revenue',
    value: '$84,200',
    icon: DollarSign,
    trend: { value: 18, isPositive: true },
    variant: 'accent',
  },
  {
    title: 'Average Rating',
    value: '4.8',
    icon: Star,
    trend: { value: 2, isPositive: true },
  },
];

const Index = () => {
  return (
    <DashboardLayout
      title="Welcome back, John! 👋"
      subtitle="Here's what's happening with your travel business today"
      showSearch={false}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 animate-fade-up delay-200">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Revenue Overview
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Monthly revenue for the year
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-success">
                  <TrendingUp className="h-4 w-4" />
                  +18% vs last year
                </div>
              </div>
              <RevenueChart />
            </div>
          </div>

          <div className="animate-fade-up delay-300">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Trip Status
              </h2>
              <TripStats />
            </div>
          </div>
        </div>

        {/* Bookings & Vehicle Row */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 animate-fade-up delay-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Bookings
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                asChild
              >
                <Link to="/bookings">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <BookingsTable />
          </div>

          <div className="animate-fade-up delay-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Fleet Status
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                asChild
              >
                <Link to="/vehicles">
                  Manage <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <VehicleDriverQuickView />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="animate-fade-up delay-400">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Reviews
            </h2>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link to="/profile">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ReviewCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
