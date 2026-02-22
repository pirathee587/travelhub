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
import { useState } from 'react';
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

const tripStatusData = [
  { name: 'Completed', value: 156, color: 'hsl(152, 60%, 42%)' },
  { name: 'Active', value: 24, color: 'hsl(187, 75%, 35%)' },
  { name: 'Cancelled', value: 12, color: 'hsl(0, 72%, 55%)' },
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

  const handleDownload = () => {
    const data = getRevenueData();
    const headers = Object.keys(data[0]).join(',');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...data.map((row) => Object.values(row).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_${viewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
                +18%
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">$84,200</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
                +12%
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">192</p>
            <p className="text-sm text-muted-foreground">Total Trips</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
                +0.3
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">4.8</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <MapPin className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-destructive">
                <TrendingDown className="h-4 w-4" />
                -2%
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">6.2%</p>
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
                    data={tripStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tripStatusData.map((entry, index) => (
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
                          style={{ width: `${(dest.bookings / 50) * 100}%` }}
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
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
