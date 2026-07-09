import { useState, useEffect } from 'react';
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
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { StatCard } from '@/features/agency/components/dashboard/StatCard';
import { BookingsTable } from '@/features/agency/components/dashboard/BookingsTable';
import { RevenueChart } from '@/features/agency/components/dashboard/RevenueChart';
import { TripStats } from '@/features/agency/components/dashboard/TripStats';
import { VehicleDriverQuickView } from '@/features/agency/components/dashboard/VehicleDriverQuickView';
import { ReviewCard } from '@/features/agency/components/dashboard/ReviewCard';
/* Shared UI Components */
import { Button } from '@/components/common/ui/button';
import { Link } from 'react-router-dom';
import { api } from '@/features/agency/services/api';
import { Skeleton } from '@/components/common/ui/skeleton';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';

const Index = () => {
  const { formatPrice } = useCurrency();
  /* Dashboard State Variables */
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Data Fetching from Backend APIs */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reviewsData] = await Promise.all([
          api.getDashboardStats(),
          api.getReviews()
        ]);

        setStats(statsData || {});
        setReviews(Array.isArray(reviewsData) ? reviewsData.slice(0, 3) : []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setStats({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* Configuration for the 6 Stat Cards at the top */
  const statCards = stats !== null ? [
    {
      title: 'Total Packages',
      value: stats.totalPackages != null ? String(stats.totalPackages) : '—',
      icon: Package,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Active Trips',
      value: stats.activeTrips != null ? String(stats.activeTrips) : '—',
      icon: Plane,
      trend: { value: 0, isPositive: true },
      variant: 'primary',
    },
    {
      title: 'Completed Trips',
      value: stats.completedTrips != null ? String(stats.completedTrips) : '—',
      icon: CheckCircle,
      trend: { value: 0, isPositive: true },
      variant: 'success',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests != null ? String(stats.pendingRequests) : '—',
      icon: Clock,
      trend: { value: 0, isPositive: false },
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue != null ? formatPrice(stats.totalRevenue) : '—',
      icon: DollarSign,
      trend: { value: 0, isPositive: true },
      variant: 'accent',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating != null ? String(stats.averageRating.toFixed(1)) : '0.0',
      icon: Star,
      trend: { value: 0, isPositive: true },
    },
  ] : [];

  return (
    <DashboardLayout
      title="Welcome back, Harith! 👋"
      subtitle="Here's what's happening with your travel business today"
      showSearch={false}
    >
      <div className="space-y-6">

        {/* 1. TOP SECTION: Statistics Cards Grid (Total Packages, Active Trips, etc.) */}
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-5 rounded-md" />
                </div>
                <Skeleton className="h-8 w-12" />
              </div>
            ))
          ) : (
            statCards.map((stat, index) => (
              <div
                key={stat.title}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatCard {...stat} />
              </div>
            ))
          )}
        </div>

        {/* 2. MIDDLE SECTION: Charts and Analytics (Revenue & Trip Status) */}
        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 animate-fade-up delay-200 min-w-0">
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

          <div className="animate-fade-up delay-300 min-w-0">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Trip Status
              </h2>
              <TripStats />
            </div>
          </div>
        </div>

        {/* 3. BOTTOM SECTION: Recent Activity (Bookings Table & Fleet Quick View) */}
        {/* Bookings & Vehicle Row */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 animate-fade-up delay-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Bookings
              </h2>
              <Button variant="ghost" size="sm" className="text-primary" asChild>
                <Link to="/agency/bookings">
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
              <Button variant="ghost" size="sm" className="text-primary" asChild>
                <Link to="/agency/vehicles">
                  Manage <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <VehicleDriverQuickView />
          </div>
        </div>

        {/* 4. FOOTER SECTION: Feedback (Recent Customer Reviews) */}
        {/* Reviews Section */}
        <div className="animate-fade-up delay-400">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Reviews
            </h2>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link to="/agency/profile">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Index;