import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/ui/select';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, MapPin, Star, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { api } from '@/features/agency/services/api';
import { Skeleton } from '@/components/common/ui/skeleton';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Analytics = () => {
  const { formatPrice, currency, rate } = useCurrency();
  /* --- ANALYTICS STATE MANAGEMENT --- */
  const [viewMode, setViewMode] = useState('monthly'); // Time period (monthly/quarterly/yearly)
  const [analytics, setAnalytics] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* DATA FETCHING: Load analytics, profile, and wallet data */
  useEffect(() => {
    const fetchAnalyticsAndProfile = async () => {
      setLoading(true);
      try {
        const [analyticsData, profileData, walletData] = await Promise.all([
          api.getAnalytics(viewMode),
          api.getProfile().catch(err => {
            console.error('Failed to load profile in analytics:', err);
            return null;
          }),
          api.getAgentWallet().catch(err => {
            console.error('Failed to load wallet in analytics:', err);
            return null;
          })
        ]);
        setAnalytics(analyticsData);
        if (profileData) setProfile(profileData);
        if (walletData) setWallet(walletData);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsAndProfile();
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

  // ── Download Professional Financial & Operational PDF Report ──
  const handleDownload = () => {
    const doc = new jsPDF();
    const agencyName = profile?.agencyName || profile?.agentName || 'TravelHub Agency Partner';
    const reportRef = `TRH-FIN-${Date.now().toString().slice(-6)}`;

    // ── PAGE DECORATION & EXECUTIVE BRANDING ──────────────────────
    doc.setFillColor(13, 148, 136); // #0d9488 Primary Teal
    doc.rect(0, 0, 210, 44, 'F');

    // Brand Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('TRAVELHUB', 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Financial & Operational Statement', 15, 24);

    // Agency Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(agencyName.toUpperCase(), 15, 33);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const contactInfo = `Email: ${profile?.email || 'N/A'}  |  Phone: ${profile?.phone || 'N/A'}`;
    doc.text(contactInfo, 15, 38);

    // Right-aligned Metadata
    doc.setFontSize(9);
    doc.text(`Report Ref: ${reportRef}`, 195, 18, { align: 'right' });
    doc.text(`Period: ${viewMode.toUpperCase()}`, 195, 24, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 195, 30, { align: 'right' });

    // ── SUBTITLE SECTION ──────────────────────────────────────────
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('1. Executive Financial Overview (Wallet & Escrow)', 15, 54);

    // ── 4 FINANCIAL KPI CARDS (Payment Implementation Upgrade) ────
    const cardWidth = 43;
    const cardHeight = 22;
    const cardY = 59;
    const spacing = 6;
    const startX = 15;

    const pendingEscrow = wallet?.pendingEscrowBalance ?? 0;
    const availableEarnings = wallet?.availableBalance ?? 0;
    const totalWithdrawn = wallet?.totalWithdrawn ?? 0;

    const cards = [
      { title: 'Gross Revenue', value: formatPrice(totalRevenue), color: [13, 148, 136] },
      { title: 'Pending Escrow', value: formatPrice(pendingEscrow), color: [245, 158, 11] },
      { title: 'Available Wallet', value: formatPrice(availableEarnings), color: [16, 185, 129] },
      { title: 'Total Withdrawn', value: formatPrice(totalWithdrawn), color: [99, 102, 241] }
    ];

    cards.forEach((card, index) => {
      const cardX = startX + index * (cardWidth + spacing);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(cardX, cardY, cardWidth, cardHeight, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(card.title, cardX + 3.5, cardY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.text(card.value, cardX + 3.5, cardY + 16);
    });

    // ── FINANCIAL AUDIT STATEMENT TABLE ───────────────────────────
    let currentY = 88;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Payment & Escrow Summary', 15, currentY);

    const walletSummaryRows = [
      ['Gross Tourist Booking Revenue', formatPrice(totalRevenue), 'Total gross value of fulfilled tourist bookings'],
      ['Pending Escrow Reserve', formatPrice(pendingEscrow), 'Funds held in Escrow awaiting trip completion'],
      ['Available Wallet Earnings', formatPrice(availableEarnings), 'Cleared funds available for bank withdrawal'],
      ['Total Withdrawn Payouts', formatPrice(totalWithdrawn), 'Total funds paid out to agency bank account']
    ];

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Financial Account Metric', 'Amount', 'Accounting Description']],
      body: walletSummaryRows,
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // ── OPERATIONAL SECTION ───────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('2. Operational Performance & Resource Utilization', 15, currentY);
    currentY += 6;

    // Revenue Breakdown Table
    const revenueRows = revenueData.map(r => [r.name, formatPrice(r.revenue)]);
    autoTable(doc, {
      startY: currentY + 2,
      head: [['Period Breakdown', 'Gross Revenue']],
      body: revenueRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Page Break Check
    if (currentY + 40 > 280) {
      doc.addPage();
      currentY = 20;
    }

    // Driver Performance Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Driver Performance Summary', 15, currentY);

    const driverRows = driverPerformance.map(d => [
      d.name,
      d.rating && d.rating > 0 ? d.rating.toFixed(1) : 'New',
      String(d.trips),
      d.status || 'Active'
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Driver Name', 'Rating', 'Completed Trips', 'Current Status']],
      body: driverRows.length > 0 ? driverRows : [['No driver records', '—', '0', '—']],
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    if (currentY + 40 > 280) {
      doc.addPage();
      currentY = 20;
    }

    // Vehicle Utilization Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Vehicle Utilization & Fleet Usage', 15, currentY);

    const vehicleRows = vehicleUtilization.map(v => [v.vehicle, String(v.trips)]);
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Vehicle Details', 'Trips Completed']],
      body: vehicleRows.length > 0 ? vehicleRows : [['No vehicle records', '0']],
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    if (currentY + 40 > 280) {
      doc.addPage();
      currentY = 20;
    }

    // Top Visited Districts Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Top Visited Districts', 15, currentY);

    const destinationRows = topDestinations.map(d => [d.name, String(d.bookings)]);
    autoTable(doc, {
      startY: currentY + 3,
      head: [['District Name', 'Total Bookings']],
      body: destinationRows.length > 0 ? destinationRows : [['No destination records', '0']],
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      margin: { left: 15, right: 15 }
    });

    // ── FOOTER & CONFIDENTIALITY NOTICE ────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(
        `Confidential Financial Statement — Generated for ${agencyName} on ${new Date().toLocaleDateString()}`,
        15,
        288
      );
      doc.text(`Page ${i} of ${pageCount}`, 195, 288, { align: 'right' });
    }

    // Save the PDF
    const filename = `${agencyName.toLowerCase().replace(/\s+/g, '_')}_financial_report_${viewMode}.pdf`;
    doc.save(filename);
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
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-primary">Total Revenue</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {formatPrice(totalRevenue)}
            </p>
          </div>

          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-success">Total Trips</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-4 w-4 text-success" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalTrips}</p>
          </div>

          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-warning">Average Rating</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                <Star className="h-4 w-4 text-warning" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {avgRating ? avgRating.toFixed(1) : '0.0'}
            </p>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-destructive">Cancellation Rate</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <MapPin className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{cancelRate}%</p>
          </div>
        </div>

        {/* 2. CONTROL BAR: Period Switcher and Report Export */}
        {/* Period Filter & Download */}
        <div className="flex items-center justify-end gap-3 bg-card/60 backdrop-blur-sm p-3 rounded-2xl border border-border/80 shadow-sm">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-44 border-primary/30 bg-background shadow-xs hover:border-primary/50 transition-colors focus:ring-primary/20 font-medium text-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="Select period" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly View</SelectItem>
              <SelectItem value="quarterly">Quarterly View</SelectItem>
              <SelectItem value="yearly">Yearly View</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleDownload}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
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
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }}
                          tickFormatter={(v) => {
                            if (!v) return currency === 'LKR' ? 'Rs. 0' : '$0';
                            if (currency === 'LKR') {
                              return v >= 1000 ? `Rs. ${Math.round(v / 1000)}k` : `Rs. ${Math.round(v)}`;
                            }
                            return v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(v)}`;
                          }}
                        />
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
                              <Star className="h-3 w-3 fill-warning" />
                              {driver.rating && driver.rating > 0 ? driver.rating.toFixed(1) : 'New'}
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
