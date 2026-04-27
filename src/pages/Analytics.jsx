import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MapPin,
  Star,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const monthlyRevenue = [
  { month: 'Jan', revenue: 4200, trips: 24 },
  { month: 'Feb', revenue: 3800, trips: 18 },
  { month: 'Mar', revenue: 5600, trips: 32 },
  { month: 'Apr', revenue: 4900, trips: 28 },
  { month: 'May', revenue: 6200, trips: 35 },
  { month: 'Jun', revenue: 7100, trips: 42 },
  { month: 'Jul', revenue: 8400, trips: 48 },
  { month: 'Aug', revenue: 7800, trips: 45 },
  { month: 'Sep', revenue: 6500, trips: 38 },
  { month: 'Oct', revenue: 5900, trips: 34 },
  { month: 'Nov', revenue: 6800, trips: 40 },
  { month: 'Dec', revenue: 9200, trips: 52 },
];

const monthlyTripStatus = [
  { name: 'Completed', value: 156, color: 'hsl(152, 60%, 42%)' },
  { name: 'Active', value: 24, color: 'hsl(187, 75%, 35%)' },
  { name: 'Cancelled', value: 12, color: 'hsl(0, 72%, 55%)' },
];

const quarterlyTripStatus = [
  { name: 'Completed', value: 340, color: 'hsl(152, 60%, 42%)' },
  { name: 'Active', value: 42, color: 'hsl(187, 75%, 35%)' },
  { name: 'Cancelled', value: 28, color: 'hsl(0, 72%, 55%)' },
];

const yearlyTripStatus = [
  { name: 'Completed', value: 1180, color: 'hsl(152, 60%, 42%)' },
  { name: 'Active', value: 120, color: 'hsl(187, 75%, 35%)' },
  { name: 'Cancelled', value: 120, color: 'hsl(0, 72%, 55%)' },
];

const ratingTrend = [
  { month: 'Jan', rating: 4.5 },
  { month: 'Feb', rating: 4.6 },
  { month: 'Mar', rating: 4.5 },
  { month: 'Apr', rating: 4.7 },
  { month: 'May', rating: 4.6 },
  { month: 'Jun', rating: 4.8 },
  { month: 'Jul', rating: 4.7 },
  { month: 'Aug', rating: 4.8 },
  { month: 'Sep', rating: 4.9 },
  { month: 'Oct', rating: 4.8 },
  { month: 'Nov', rating: 4.8 },
  { month: 'Dec', rating: 4.9 },
];

const topDestinations = [
  { name: 'Sigiriya, Dambulla', bookings: 42, revenue: 102900 },
  { name: 'Ella, Badulla', bookings: 28, revenue: 62400 },
  { name: 'Galle Fort, Galle', bookings: 35, revenue: 82000 },
  { name: 'Yala National Park', bookings: 22, revenue: 50200 },
  { name: 'Mirissa, Matara', bookings: 30, revenue: 78000 },
];

const quarterlyRevenue = [
  { name: 'Q1', revenue: 12500, trips: 85 },
  { name: 'Q2', revenue: 15400, trips: 95 },
  { name: 'Q3', revenue: 22800, trips: 125 },
  { name: 'Q4', revenue: 18500, trips: 105 },
];

const yearlyRevenue = [
  { name: '2021', revenue: 54000, trips: 280 },
  { name: '2022', revenue: 68500, trips: 340 },
  { name: '2023', revenue: 76000, trips: 380 },
  { name: '2024', revenue: 84200, trips: 420 },
];

const quarterlyRatingTrend = [
  { name: 'Q1', rating: 4.6 },
  { name: 'Q2', rating: 4.7 },
  { name: 'Q3', rating: 4.8 },
  { name: 'Q4', rating: 4.8 },
];

const yearlyRatingTrend = [
  { name: '2021', rating: 4.5 },
  { name: '2022', rating: 4.6 },
  { name: '2023', rating: 4.7 },
  { name: '2024', rating: 4.8 },
];

const Analytics = () => {
  const [viewMode, setViewMode] = useState('monthly');

  const getRevenueData = () => {
    switch (viewMode) {
      case 'quarterly':
        return quarterlyRevenue;
      case 'yearly':
        return yearlyRevenue;
      default:
        return monthlyRevenue;
    }
  };

  const getRatingData = () => {
    switch (viewMode) {
      case 'quarterly':
        return quarterlyRatingTrend;
      case 'yearly':
        return yearlyRatingTrend;
      default:
        return ratingTrend;
    }
  };

  const getTripStatusData = () => {
    switch (viewMode) {
      case 'quarterly':
        return quarterlyTripStatus;
      case 'yearly':
        return yearlyTripStatus;
      default:
        return monthlyTripStatus;
    }
  };

  const handleDownload = () => {
    const rows = [];

    // Revenue Data
    const revenueData = getRevenueData();
    rows.push('--- Revenue Data ---');
    rows.push(Object.keys(revenueData[0]).join(','));
    revenueData.forEach((row) => rows.push(Object.values(row).join(',')));
    rows.push('');

    // Trip Status Data
    const tripStatus = getTripStatusData();
    rows.push('--- Trip Status ---');
    rows.push('Status,Count');
    tripStatus.forEach((row) => rows.push(`${row.name},${row.value}`));
    rows.push('');

    // Top Destinations
    rows.push('--- Top Destinations ---');
    rows.push('Destination,Bookings,Revenue');
    topDestinations.forEach((d) =>
      rows.push(`${d.name},${d.bookings},${d.revenue}`)
    );
    rows.push('');

    // Driver Performance
    rows.push('--- Driver Performance ---');
    rows.push('Driver,Trips,Rating');
    [
      { name: 'Nimal Perera', trips: 48, rating: 4.8 },
      { name: 'Kavindu Jayasinghe', trips: 42, rating: 4.5 },
      { name: 'Tharushi Fernando', trips: 38, rating: 4.9 },
      { name: 'Saman Kumara', trips: 30, rating: 4.7 },
      { name: 'Dilshan Silva', trips: 25, rating: 4.6 },
    ].forEach((d) => rows.push(`${d.name},${d.trips},${d.rating}`));
    rows.push('');

    // Vehicle Utilization
    rows.push('--- Vehicle Utilization ---');
    rows.push('Vehicle,Trips');
    [
      { name: 'Toyota Alphard', trips: 52 },
      { name: 'Mercedes V-Class', trips: 45 },
      { name: 'Bajaj RE 4S', trips: 38 },
      { name: 'Suzuki Alto 800', trips: 30 },
      { name: 'Maruti Suzuki Wagon R', trips: 18 },
    ].forEach((v) => rows.push(`${v.name},${v.trips}`));

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_full_report_${viewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    let revenueData;
    let ratingData;

    switch (viewMode) {
      case 'quarterly':
        revenueData = quarterlyRevenue;
        ratingData = quarterlyRatingTrend;
        break;
      case 'yearly':
        revenueData = yearlyRevenue;
        ratingData = yearlyRatingTrend;
        break;
      case 'monthly':
      default:
        revenueData = monthlyRevenue;
        ratingData = ratingTrend;
    }

    const totalRevenue = revenueData.reduce(
      (acc, curr) => acc + curr.revenue,
      0
    );
    const totalTrips = revenueData.reduce((acc, curr) => acc + curr.trips, 0);
    const avgRating = (
      ratingData.reduce((acc, curr) => acc + curr.rating, 0) /
      ratingData.length
    ).toFixed(1);

    const mockTrends = {
      monthly: {
        revTrend: '+18%',
        tripTrend: '+12%',
        ratingTrend: '+0.3',
        cancelRate: '6.2%',
        cancelTrend: '-2%',
      },
      quarterly: {
        revTrend: '+15%',
        tripTrend: '+8%',
        ratingTrend: '+0.2',
        cancelRate: '5.8%',
        cancelTrend: '-1%',
      },
      yearly: {
        revTrend: '+22%',
        tripTrend: '+15%',
        ratingTrend: '+0.4',
        cancelRate: '4.5%',
        cancelTrend: '-3%',
      },
    };

    return {
      revenue: `$${totalRevenue.toLocaleString()}`,
      trips: totalTrips.toLocaleString(),
      rating: avgRating,
      ...mockTrends[viewMode],
    };
  }, [viewMode]);

  return (
    <DashboardLayout
      title="Analytics & Reports"
      subtitle="Track your business performance and trends"
      showSearch={false}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
                {stats.revTrend}
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{stats.revenue}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
                {stats.tripTrend}
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{stats.trips}</p>
            <p className="text-sm text-muted-foreground">Total Trips</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
                {stats.ratingTrend}
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{stats.rating}</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <MapPin className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-destructive">
                <TrendingDown className="h-4 w-4" />
                {stats.cancelTrend}
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{stats.cancelRate}</p>
            <p className="text-sm text-muted-foreground">Cancellation Rate</p>
          </div>
        </div>

        {/* Date Filter */}
        {/* Date Filter & Download */}
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
            <Download className="h-4 w-4" />
            Download Document
          </Button>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground capitalize">
              {viewMode} Revenue
            </h3>
            <p className="text-sm text-muted-foreground">
              Revenue performance over the{' '}
              {viewMode === 'monthly' ? 'year' : 'period'}
            </p>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getRevenueData()}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(214, 25%, 90%)"
                  />
                  <XAxis
                    dataKey={viewMode === 'monthly' ? 'month' : 'name'}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 25%, 90%)',
                      borderRadius: '12px',
                    }}
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      'Revenue',
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="hsl(187, 75%, 35%)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Trip Status
            </h3>
            <p className="text-sm text-muted-foreground">
              Distribution by status
            </p>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getTripStatusData()}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {getTripStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Rating Trend
            </h3>
            <p className="text-sm text-muted-foreground">
              Average customer rating over time
            </p>
            <div className="mt-6 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getRatingData()}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(214, 25%, 90%)"
                  />
                  <XAxis
                    dataKey={viewMode === 'monthly' ? 'month' : 'name'}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }}
                  />

                  <YAxis
                    domain={[4, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 25%, 90%)',
                      borderRadius: '12px',
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(38, 92%, 55%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(38, 92%, 55%)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Top Destinations
            </h3>
            <p className="text-sm text-muted-foreground">
              Most popular travel destinations
            </p>
            <div className="mt-6 space-y-4">
              {topDestinations.map((dest, index) => (
                <div key={dest.name} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{dest.name}</p>
                      <p className="text-sm font-semibold text-foreground">
                        ${dest.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${(dest.bookings / Math.max(...topDestinations.map(d => d.bookings))) * 100}%` }}
                        />
                      </div>
                      <span className="ml-3 text-sm text-muted-foreground">
                        {dest.bookings} trips
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Driver Performance & Vehicle Utilization */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Driver Performance
            </h3>
            <p className="text-sm text-muted-foreground">
              Top 5 drivers by number of trips completed
            </p>
            <div className="mt-6 space-y-5">
              {[
                { name: 'Nimal Perera', trips: 48, rating: 4.8 },
                { name: 'Kavindu Jayasinghe', trips: 42, rating: 4.5 },
                { name: 'Tharushi Fernando', trips: 38, rating: 4.9 },
                { name: 'Saman Kumara', trips: 30, rating: 4.7 },
                { name: 'Dilshan Silva', trips: 25, rating: 4.6 },
              ].map((driver, index) => (
                <div key={driver.name} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-medium text-foreground truncate">{driver.name}</p>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                        <Star className="h-3 w-3 fill-warning" />
                        {driver.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(driver.trips / 48) * 100}%`,
                            backgroundColor: 'hsl(187, 75%, 35%)',
                          }}
                        />
                      </div>
                      <span className="shrink-0 text-sm font-medium text-foreground w-16 text-right">
                        {driver.trips} trips
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Vehicle Utilization
            </h3>
            <p className="text-sm text-muted-foreground">
              Trips completed per vehicle
            </p>
            <div className="mt-6 space-y-5">
              {[
                { name: 'Toyota Alphard', trips: 52 },
                { name: 'Mercedes V-Class', trips: 45 },
                { name: 'Bajaj RE 4S', trips: 38 },
                { name: 'Suzuki Alto 800', trips: 30 },
                { name: 'Maruti Suzuki Wagon R', trips: 18 },
              ].map((vehicle, index) => (
                <div key={vehicle.name} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate mb-1.5">{vehicle.name}</p>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(vehicle.trips / 52) * 100}%`,
                            backgroundColor: 'hsl(16, 85%, 60%)',
                          }}
                        />
                      </div>
                      <span className="shrink-0 text-sm font-medium text-foreground w-16 text-right">
                        {vehicle.trips} trips
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
