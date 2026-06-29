import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/ui/select';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, MapPin, Star, Download } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { api } from '@/features/agency/services/api';
import { Skeleton } from '@/components/common/ui/skeleton';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';

const Analytics = () => {
  const { formatPrice, currency, rate } = useCurrency();
  /* --- ANALYTICS STATE MANAGEMENT --- */
  const [viewMode, setViewMode] = useState('monthly'); // Time period (monthly/quarterly/yearly)
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  /* DATA FETCHING: Load analytics data whenever viewMode changes */
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await api.getAnalytics(viewMode);
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [viewMode]);

  // ── DATA PROCESSING: Convert API data into Recharts-friendly formats ────────
  const revenueData = analytics?.revenueData?.map(d => ({
    month: d.label,
    name: d.label,
    revenue: currency === 'LKR' ? d.value * rate : d.value,
  })) ?? [];

  const tripStatusData = analytics?.tripStatusData
    ? [
      { name: 'Completed', value: analytics.tripStatusData.completed ?? 0, color: 'hsl(152, 60%, 42%)' },
      { name: 'Active', value: analytics.tripStatusData.active ?? 0, color: 'hsl(187, 75%, 35%)' },
      { name: 'Pending', value: analytics.tripStatusData.pending ?? 0, color: 'hsl(38, 92%, 55%)' },
      { name: 'Cancelled', value: analytics.tripStatusData.cancelled ?? 0, color: 'hsl(0, 72%, 55%)' },
    ]
    : [];

  const topDestinations = analytics?.topDestinations?.map(d => ({
    name: d.district,
    bookings: d.count,
  })) ?? [];

  const driverPerformance = analytics?.driverPerformance ?? [];
  const vehicleUtilization = analytics?.vehicleUtilization ?? [];

  const maxDriverTrips = Math.max(...driverPerformance.map(d => d.trips ?? 0), 1);
  const maxVehicleTrips = Math.max(...vehicleUtilization.map(v => v.trips ?? 0), 1);
  const maxDestBookings = Math.max(...topDestinations.map(d => d.bookings ?? 0), 1);

  // ── Download CSV ────────────────────────────────────────────
  const handleDownload = () => {
    const rows = [];
    rows.push('--- Revenue Data ---');
    rows.push('Period,Revenue');
    revenueData.forEach(r => rows.push(`${r.name},${r.revenue}`));
    rows.push('');
    rows.push('--- Trip Status ---');
    rows.push('Status,Count');
    tripStatusData.forEach(t => rows.push(`${t.name},${t.value}`));
    rows.push('');
    rows.push('--- Top Destinations ---');
    rows.push('Destination,Trips');
    topDestinations.forEach(d => rows.push(`${d.name},${d.bookings}`));
    rows.push('');
    rows.push('--- Driver Performance ---');
    rows.push('Driver,Rating,Status');
    driverPerformance.forEach(d => rows.push(`${d.name},${d.rating},${d.status}`));
    rows.push('');
    rows.push('--- Vehicle Utilization ---');
    rows.push('Vehicle,Trips');
    vehicleUtilization.forEach(v => rows.push(`${v.vehicle},${v.trips}`));

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `analytics_${viewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* --- SUMMARY STATISTICS (Top Row Values) --- */
  const totalRevenue = analytics?.totalRevenue ?? 0;
  const totalTrips = analytics?.totalTrips ?? 0;
  const avgRating = analytics?.averageRating ?? 0;
  const cancelRate = analytics?.cancellationRate ?? 0;

  return (
    <DashboardLayout
      title="Analytics & Reports"
      subtitle="Track your business performance and trends"
      showSearch={false}
    >
      <div className="space-y-6">

        {/* 1. TOP SECTION: Key Performance Indicators (KPIs) Summary Cards */}
        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">
              {formatPrice(totalRevenue)}
            </p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{totalTrips}</p>
            <p className="text-sm text-muted-foreground">Total Trips</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">
              {avgRating ? avgRating.toFixed(1) : '0.0'}
            </p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <MapPin className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-destructive">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{cancelRate}%</p>
            <p className="text-sm text-muted-foreground">Cancellation Rate</p>
          </div>
        </div>

        {/* 2. CONTROL BAR: Period Switcher and Report Export */}
        {/* Period Filter & Download */}
        <div className="flex justify-end gap-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />Download Report
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-[300px] w-full" />
              </div>
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="flex justify-center py-6">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 3. CHART SECTION: Revenue Trends and Trip Status Distribution */}
            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 min-w-0">
                <h3 className="text-lg font-semibold text-foreground capitalize">{viewMode} Revenue</h3>
                <p className="text-sm text-muted-foreground">Revenue performance over the period</p>
                <div className="mt-6 h-[300px]">
                  {revenueData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">No revenue data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }} tickFormatter={(v) => currency === 'LKR' ? `Rs. ${Math.round(v / 1000)}k` : `$${v / 1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(0,0%,100%)', border: '1px solid hsl(214,25%,90%)', borderRadius: '12px' }} formatter={(v) => [formatPrice(currency === 'LKR' ? v / rate : v), 'Revenue']} />
                        <Bar dataKey="revenue" fill="hsl(187, 75%, 35%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">Trip Status</h3>
                <p className="text-sm text-muted-foreground">Distribution by status</p>
                <div className="mt-6 h-[300px]">
                  {tripStatusData.every(d => d.value === 0) ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">No trip data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={tripStatusData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                          {tripStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* 4. PERFORMANCE SECTION: Popular Destinations and Driver Rankings */}
            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Districts */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">Top Districts</h3>
                <p className="text-sm text-muted-foreground">Most popular starting districts</p>
                <div className="mt-6 space-y-4">
                  {topDestinations.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No district data yet</p>
                  ) : (
                    topDestinations.map((dest, index) => (
                      <div key={dest.name} className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{dest.name}</p>
                            <p className="text-sm font-semibold text-foreground">{dest.bookings} trips</p>
                          </div>
                          <div className="mt-1">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                style={{ width: `${(dest.bookings / maxDestBookings) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Driver Performance */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">Driver Performance</h3>
                <p className="text-sm text-muted-foreground">Drivers by rating and status</p>
                <div className="mt-6 space-y-5">
                  {driverPerformance.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No driver data yet</p>
                  ) : (
                    driverPerformance.map((driver, index) => (
                      <div key={driver.name} className="flex items-center gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-medium text-foreground truncate">{driver.name}</p>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                              <Star className="h-3 w-3 fill-warning" />{driver.rating ?? '-'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{driver.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 5. UTILIZATION SECTION: Fleet usage analysis */}
            {/* Vehicle Utilization */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">Vehicle Utilization</h3>
                <p className="text-sm text-muted-foreground">Trips completed per vehicle</p>
                <div className="mt-6 space-y-5">
                  {vehicleUtilization.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No vehicle data yet</p>
                  ) : (
                    vehicleUtilization.map((vehicle, index) => (
                      <div key={vehicle.name} className="flex items-center gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate mb-1.5">
                            {vehicle.name} <span className="text-xs text-muted-foreground">({vehicle.registration})</span>
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${(vehicle.trips / maxVehicleTrips) * 100}%`, backgroundColor: 'hsl(16, 85%, 60%)' }} />
                            </div>
                            <span className="shrink-0 text-sm font-medium text-foreground w-16 text-right">
                              {vehicle.trips} trips
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
