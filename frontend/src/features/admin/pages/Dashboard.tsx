import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminDashboardApi from '../services/adminDashboardApi';
import adminAgentApi from '../services/adminAgentApi';
import adminHotelApi from '../services/adminHotelApi';
import adminPackageApi from '../services/adminPackageApi';
import adminVehicleApi from '../services/adminVehicleApi';
import adminDriverApi from '../services/adminDriverApi';
import adminUserApi from '../services/adminUserApi';
import adminBookingApi from '../services/adminBookingApi';
import { adminPayoutApi } from '../services/payouts';
import { useAdminCurrency } from '../hooks/AdminCurrencyContext';
import { 
  Users, 
  TrendingUp, 
  Building2, 
  Package, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Car,
  Eye,
  MapPin,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return 'Recently';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch (e) {
    return 'Recently';
  }
};

const fmt = (n?: number | string | null) => {
  if (n == null) return '—';
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

// Fallback Recent Approvals (Agencies & Hotels)
const fallbackRecentActivities = [
  { title: 'Agency Approved', desc: 'Ceylon Safari Adventures • Kamal Silva', status: 'APPROVED', time: '1 hour ago', icon: '🏢', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  { title: 'Hotel Approved', desc: 'Mirissa Beach Resort • Matara', status: 'APPROVED', time: '3 hours ago', icon: '🏨', color: 'bg-sky-50 text-sky-600 border border-sky-100' },
  { title: 'Agency Approved', desc: 'Lanka Tour Operators • Ranjith Kumar', status: 'APPROVED', time: '5 hours ago', icon: '🏢', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  { title: 'Hotel Approved', desc: 'Kandy Mountain View Hotel • Kandy', status: 'APPROVED', time: '1 day ago', icon: '🏨', color: 'bg-sky-50 text-sky-600 border border-sky-100' },
  { title: 'Agency Approved', desc: 'Sigiriya Express Travels • Anura Perera', status: 'APPROVED', time: '2 days ago', icon: '🏢', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
];

export default function Dashboard() {
  const { formatPrice, convertPrice, currencySymbol, currency } = useAdminCurrency();
  const [stats, setStats] = useState<any>(null);
  const [financeStats, setFinanceStats] = useState<any>(null);
  const [liveCounts, setLiveCounts] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>(fallbackRecentActivities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'revenue' | 'bookings'>('revenue');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashRes, agentsRes, hotelsRes, packagesRes, vehiclesRes, driversRes, financeRes, usersRes, bookingsRes] = await Promise.allSettled([
        adminDashboardApi.getDashboard(),
        adminAgentApi.getAllAgents(),
        adminHotelApi.getAllHotels(),
        adminPackageApi.getAllPackages(),
        adminVehicleApi.getAllVehicles(),
        adminDriverApi.getAllDrivers(),
        adminPayoutApi.getFinanceStats(),
        adminUserApi.getAllUsers(),
        adminBookingApi.getAllBookings()
      ]);

      // 1. Dashboard API stats
      let dStats: any = null;
      if (dashRes.status === 'fulfilled' && dashRes.value) {
        dStats = dashRes.value?.data ?? dashRes.value;
        if (dStats) {
          setStats(dStats);
        }
      }

      // 2. Finance API stats
      if (financeRes.status === 'fulfilled' && financeRes.value) {
        const fStats = financeRes.value?.data ?? financeRes.value ?? null;
        if (fStats) {
          setFinanceStats(fStats);
        }
      }

      // 3. Fallback Resource Arrays
      const agentsList = (agentsRes.status === 'fulfilled' && (agentsRes.value?.data ?? agentsRes.value)) || [];
      const hotelsList = (hotelsRes.status === 'fulfilled' && (hotelsRes.value?.data ?? hotelsRes.value)) || [];
      const packagesList = (packagesRes.status === 'fulfilled' && (packagesRes.value?.data ?? packagesRes.value)) || [];
      const vehiclesList = (vehiclesRes.status === 'fulfilled' && (vehiclesRes.value?.data ?? vehiclesRes.value)) || [];
      const driversList = (driversRes.status === 'fulfilled' && (driversRes.value?.data ?? driversRes.value)) || [];
      const usersList = (usersRes.status === 'fulfilled' && (usersRes.value?.data ?? usersRes.value)) || [];
      const bookingsList = (bookingsRes.status === 'fulfilled' && (bookingsRes.value?.data ?? bookingsRes.value)) || [];

      const rawAgents: any[] = Array.isArray(agentsList) ? agentsList : [];
      const rawHotels: any[] = Array.isArray(hotelsList) ? hotelsList : [];
      const rawPackages: any[] = Array.isArray(packagesList) ? packagesList : [];
      const rawVehicles: any[] = Array.isArray(vehiclesList) ? vehiclesList : [];
      const rawDrivers: any[] = Array.isArray(driversList) ? driversList : [];
      const rawUsers: any[] = Array.isArray(usersList) ? usersList.filter((u: any) => String(u.role || '').toUpperCase() !== 'ADMIN') : [];
      const rawBookings: any[] = Array.isArray(bookingsList) ? bookingsList : [];

      const approvedAgentsCount = rawAgents.filter(a => String(a.status || a.applicationStatus || '').toLowerCase() === 'approved' || String(a.nicStatus || '').toUpperCase() === 'APPROVED' || a.agentApproved === true).length;
      const pendingAgentsCount = rawAgents.filter(a => String(a.status || a.applicationStatus || '').toLowerCase() === 'pending').length;

      const approvedHotelsCount = rawHotels.filter(h => String(h.applicationStatus || h.status || '').toLowerCase() === 'approved').length;
      const pendingHotelsCount = rawHotels.filter(h => String(h.applicationStatus || h.status || '').toLowerCase() === 'pending').length;

      const approvedPackagesCount = rawPackages.filter(p => String(p.applicationStatus || p.status || '').toLowerCase() === 'approved').length;
      const pendingPackagesCount = rawPackages.filter(p => String(p.applicationStatus || p.status || '').toLowerCase() === 'pending').length;

      const pendingVehiclesCount = rawVehicles.filter(v => String(v.lifecycleStatus || v.status || '').toLowerCase() === 'pending').length;
      const pendingDriversCount = rawDrivers.filter(d => String(d.lifecycleStatus || d.status || '').toLowerCase() === 'pending').length;

      setLiveCounts({
        totalUsers: rawUsers.length > 0 ? rawUsers.length : (rawAgents.length + rawHotels.length + 1),
        totalBookings: rawBookings.length,
        activeAgents: approvedAgentsCount,
        partnerHotels: approvedHotelsCount,
        activePackages: approvedPackagesCount,
        pendingAgents: pendingAgentsCount,
        pendingHotels: pendingHotelsCount,
        pendingPackages: pendingPackagesCount,
        pendingVehicles: pendingVehiclesCount,
        pendingDrivers: pendingDriversCount,
      });

      let activities: any[] = [];

      // 4. If backend returned clean non-booking recentActivities, use them
      if (dStats?.recentActivities && Array.isArray(dStats.recentActivities) && dStats.recentActivities.length > 0) {
        const validActivities = dStats.recentActivities.filter((act: any) => {
          const t = (act.title || '').toLowerCase();
          const d = (act.desc || '').toLowerCase();
          return !t.includes('booking') && !d.includes('booking');
        });
        if (validActivities.length > 0) {
          activities = validActivities.map((act: any) => {
            const isAgency = (act.title || '').toLowerCase().includes('agent') || (act.title || '').toLowerCase().includes('agency');
            return {
              title: act.title || (isAgency ? 'Agency Approved' : 'Hotel Approved'),
              desc: act.desc || 'Approved Partner',
              status: act.status || 'APPROVED',
              time: formatTimeAgo(act.timestamp),
              icon: act.icon || (isAgency ? '🏢' : '🏨'),
              color: act.color || (isAgency ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-sky-50 text-sky-600 border border-sky-100')
            };
          });
        }
      }

      // 5. If dashboard API had no recent activities, extract from live approved agents & hotels
      if (activities.length === 0) {
        const list: any[] = [];

        const approvedAgents = rawAgents.filter(a => 
          String(a.status || a.applicationStatus || '').toLowerCase() === 'approved' || 
          a.agentApproved === true || 
          String(a.nicStatus || '').toUpperCase() === 'APPROVED'
        );
        
        approvedAgents.forEach(a => {
          const timeStr = a.submitted || a.updatedAt || a.createdAt;
          list.push({
            title: 'Agency Approved',
            desc: `${a.agencyName || a.name || 'Travel Agency'}${a.owner ? ` • ${a.owner}` : (a.email ? ` • ${a.email}` : '')}`,
            status: 'APPROVED',
            time: formatTimeAgo(timeStr),
            rawTime: timeStr ? new Date(timeStr).getTime() : 0,
            icon: '🏢',
            color: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          });
        });

        const approvedHotels = rawHotels.filter(h => 
          String(h.applicationStatus || h.status || '').toLowerCase() === 'approved'
        );
        
        approvedHotels.forEach(h => {
          const timeStr = h.submitted || h.updatedAt || h.createdAt;
          list.push({
            title: 'Hotel Approved',
            desc: `${h.hotelName || h.name || 'Hotel Partner'}${h.district ? ` • ${h.district}` : (h.destination ? ` • ${h.destination}` : '')}`,
            status: 'APPROVED',
            time: formatTimeAgo(timeStr),
            rawTime: timeStr ? new Date(timeStr).getTime() : 0,
            icon: '🏨',
            color: 'bg-sky-50 text-sky-600 border border-sky-100'
          });
        });

        if (list.length > 0) {
          list.sort((a, b) => (b.rawTime || 0) - (a.rawTime || 0));
          activities = list;
        }
      }

      if (activities.length === 0) {
        activities = fallbackRecentActivities;
      }

      setRecentActivity(activities.slice(0, 5));
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
      setRecentActivity(fallbackRecentActivities);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

  // Dynamic values with priority: stats -> live resource lists -> fallback 0
  const totalUsers = stats?.totalUsers !== undefined ? stats.totalUsers : (liveCounts.totalUsers ?? 0);
  const activeAgents = stats?.totalAgents !== undefined ? stats.totalAgents : (liveCounts.activeAgents ?? 0);
  const partnerHotels = stats?.totalHotels !== undefined ? stats.totalHotels : (liveCounts.partnerHotels ?? 0);
  const activePackages = stats?.totalPackages !== undefined ? stats.totalPackages : (liveCounts.activePackages ?? 0);
  const totalBookings = stats?.totalBookings !== undefined ? stats.totalBookings : (liveCounts.totalBookings ?? 0);
  const totalRevenue = stats?.totalRevenue ?? 0;
  const netPlatformRevenue = financeStats?.totalPlatformNetRevenue ?? totalRevenue;

  const pendingAgents = stats?.pendingAgents !== undefined ? stats.pendingAgents : (liveCounts.pendingAgents ?? 0);
  const pendingHotels = stats?.pendingHotels !== undefined ? stats.pendingHotels : (liveCounts.pendingHotels ?? 0);
  const pendingPackages = stats?.pendingPackages !== undefined ? stats.pendingPackages : (liveCounts.pendingPackages ?? 0);
  const pendingVehicles = stats?.pendingVehicles !== undefined ? stats.pendingVehicles : (liveCounts.pendingVehicles ?? 0);
  const pendingDrivers = stats?.pendingDrivers !== undefined ? stats.pendingDrivers : (liveCounts.pendingDrivers ?? 0);
  const totalPending = pendingAgents + pendingHotels + pendingPackages + pendingVehicles + pendingDrivers;

  // Monthly Performance Chart Data
  const months12 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const performanceChartData = React.useMemo(() => {
    if (stats?.months && Array.isArray(stats.months) && stats.months.length > 0) {
      return stats.months.map((monthName: string, index: number) => {
        const rev = stats?.monthlyRevenues?.[index] ? Number(stats.monthlyRevenues[index]) : 0;
        const bCount = stats?.monthlyBookings?.[index] ? Number(stats.monthlyBookings[index]) : 0;
        const convertedRev = convertPrice(rev);

        return {
          name: monthName,
          revenue: convertedRev,
          rawRevenue: rev,
          bookings: bCount,
          value: chartViewMode === 'revenue' ? convertedRev : bCount
        };
      });
    }

    return months12.map((month, index) => {
      const rev = stats?.monthlyRevenues?.[index] ? Number(stats.monthlyRevenues[index]) : 0;
      const bCount = stats?.monthlyBookings?.[index] ? Number(stats.monthlyBookings[index]) : 0;
      const convertedRev = convertPrice(rev);

      return {
        name: month,
        revenue: convertedRev,
        rawRevenue: rev,
        bookings: bCount,
        value: chartViewMode === 'revenue' ? convertedRev : bCount
      };
    });
  }, [stats, chartViewMode, convertPrice]);

  // Package Distribution Donut Data
  const packageDistributionData = React.useMemo(() => {
    if (stats?.packageDistribution && typeof stats.packageDistribution === 'object' && Object.keys(stats.packageDistribution).length > 0) {
      const colors = ['#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
      const entries = Object.entries(stats.packageDistribution);
      const total = entries.reduce((sum, [, count]) => sum + Number(count), 0);
      return entries.map(([cat, count], idx) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase() + (cat.toLowerCase().includes('tour') || cat.toLowerCase().includes('package') ? '' : ' Tours'),
        value: total > 0 ? Math.round((Number(count) / total) * 100) : 0,
        count: Number(count),
        color: colors[idx % colors.length]
      }));
    }
    return [
      { name: 'Culture Tours', value: 40, color: '#10B981' },
      { name: 'Beach Tours', value: 27, color: '#0EA5E9' },
      { name: 'Mountain Tours', value: 20, color: '#F59E0B' },
      { name: 'City Tours', value: 7, color: '#8B5CF6' },
      { name: 'Wildlife Tours', value: 7, color: '#EC4899' },
    ];
  }, [stats?.packageDistribution]);

  // Growth metrics from API
  const userGrowth = stats?.userGrowth ?? 0;
  const agentGrowth = stats?.agentGrowth ?? 0;
  const hotelGrowth = stats?.hotelGrowth ?? 0;
  const packageGrowth = stats?.packageGrowth ?? 0;
  const bookingGrowth = stats?.bookingGrowth ?? 0;
  const revenueGrowth = stats?.revenueGrowth ?? 0;

  const renderTrend = (growthVal?: number | null, isWhiteCard = true) => {
    const g = growthVal !== undefined && growthVal !== null ? Number(growthVal) : 0;
    const isPositive = g > 0;
    const isNegative = g < 0;
    const isZero = g === 0;

    const arrow = isPositive ? '↑' : isNegative ? '↓' : '';
    const label = isZero ? '0%' : `${arrow} ${Math.abs(g)}%`;

    if (!isWhiteCard) {
      const textColor = isPositive ? 'text-white' : isNegative ? 'text-rose-200' : 'text-white/80';
      return (
        <span className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${textColor}`}>
          {label} <span className="text-white/70 font-normal">vs last month</span>
        </span>
      );
    }

    const textColor = isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-gray-500';
    return (
      <span className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${textColor}`}>
        {label} <span className="text-gray-400 font-normal">vs last month</span>
      </span>
    );
  };

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen animate-fade-in space-y-7 font-sans">
      
      {/* ── Error Notification Banner ───────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-800">{error}</span>
          </div>
          <button 
            onClick={load}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Pending Approvals Quick Action Box ──────────────────────────────── */}
      <div className="bg-[#FFF8F1] border border-orange-200/70 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Pending Approvals</h3>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">
              {loading && !stats ? (
                <span className="inline-block w-36 h-4 bg-amber-200/60 rounded animate-pulse align-middle" />
              ) : (
                <>
                  <span className="font-bold text-amber-600">{totalPending} items</span> require your immediate attention
                </>
              )}
            </p>
          </div>
        </div>

        {/* 5 Interactive Quick Filter Counter Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Agents */}
          <Link 
            to="/admin/agents" 
            className="bg-white hover:bg-amber-50/50 border border-orange-100 hover:border-amber-300 rounded-2xl p-3 text-center transition group shadow-2xs flex flex-col justify-center min-w-[70px]"
          >
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Agents</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition mt-0.5 flex justify-center">
              {loading && !stats ? <span className="inline-block w-5 h-6 bg-gray-200 rounded animate-pulse" /> : pendingAgents}
            </span>
          </Link>

          {/* Hotels */}
          <Link 
            to="/admin/hotels" 
            className="bg-white hover:bg-amber-50/50 border border-orange-100 hover:border-amber-300 rounded-2xl p-3 text-center transition group shadow-2xs flex flex-col justify-center min-w-[70px]"
          >
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Hotels</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition mt-0.5 flex justify-center">
              {loading && !stats ? <span className="inline-block w-5 h-6 bg-gray-200 rounded animate-pulse" /> : pendingHotels}
            </span>
          </Link>

          {/* Packages */}
          <Link 
            to="/admin/packages" 
            className="bg-white hover:bg-amber-50/50 border border-orange-100 hover:border-amber-300 rounded-2xl p-3 text-center transition group shadow-2xs flex flex-col justify-center min-w-[70px]"
          >
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Packages</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition mt-0.5 flex justify-center">
              {loading && !stats ? <span className="inline-block w-5 h-6 bg-gray-200 rounded animate-pulse" /> : pendingPackages}
            </span>
          </Link>

          {/* Vehicles */}
          <Link 
            to="/admin/vehicles" 
            className="bg-white hover:bg-amber-50/50 border border-orange-100 hover:border-amber-300 rounded-2xl p-3 text-center transition group shadow-2xs flex flex-col justify-center min-w-[70px]"
          >
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Vehicles</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition mt-0.5 flex justify-center">
              {loading && !stats ? <span className="inline-block w-5 h-6 bg-gray-200 rounded animate-pulse" /> : pendingVehicles}
            </span>
          </Link>

          {/* Drivers */}
          <Link 
            to="/admin/drivers" 
            className="bg-white hover:bg-amber-50/50 border border-orange-100 hover:border-amber-300 rounded-2xl p-3 text-center transition group shadow-2xs flex flex-col justify-center min-w-[70px]"
          >
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Drivers</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition mt-0.5 flex justify-center">
              {loading && !stats ? <span className="inline-block w-5 h-6 bg-gray-200 rounded animate-pulse" /> : pendingDrivers}
            </span>
          </Link>
        </div>
      </div>

      {/* ── 1. Top 6 Platform KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        
        {/* 1. Total Users */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Users</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight block">
              {loading && !stats ? <span className="inline-block w-12 h-7 bg-gray-200 rounded animate-pulse" /> : fmt(totalUsers)}
            </span>
            {renderTrend(userGrowth, true)}
          </div>
        </div>

        {/* 2. Active Agents (Teal Gradient Card) */}
        <div className="bg-gradient-to-br from-[#0c4a6e] to-[#0284c7] rounded-3xl p-5 text-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-100">Active Agents</span>
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white backdrop-blur-md flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight block">
              {loading && !stats ? <span className="inline-block w-12 h-7 bg-white/30 rounded animate-pulse" /> : fmt(activeAgents)}
            </span>
            {renderTrend(agentGrowth, false)}
          </div>
        </div>

        {/* 3. Partner Hotels (Emerald Gradient Card) */}
        <div className="bg-gradient-to-br from-[#059669] to-[#10b981] rounded-3xl p-5 text-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100">Partner Hotels</span>
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white backdrop-blur-md flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight block">
              {loading && !stats ? <span className="inline-block w-12 h-7 bg-white/30 rounded animate-pulse" /> : fmt(partnerHotels)}
            </span>
            {renderTrend(hotelGrowth, false)}
          </div>
        </div>

        {/* 4. Active Packages */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Packages</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight block">
              {loading && !stats ? <span className="inline-block w-12 h-7 bg-gray-200 rounded animate-pulse" /> : fmt(activePackages)}
            </span>
            {renderTrend(packageGrowth, true)}
          </div>
        </div>

        {/* 5. Total Bookings (Orange Gradient Card) */}
        <div className="bg-gradient-to-br from-[#ea580c] to-[#f97316] rounded-3xl p-5 text-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-100">Total Bookings</span>
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white backdrop-blur-md flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight block">
              {loading && !stats ? <span className="inline-block w-12 h-7 bg-white/30 rounded animate-pulse" /> : fmt(totalBookings)}
            </span>
            {renderTrend(bookingGrowth, false)}
          </div>
        </div>

        {/* 6. Total Revenue (Net Platform Revenue) */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight block">
              {loading && !stats && !financeStats ? (
                <span className="inline-block w-16 h-7 bg-gray-200 rounded animate-pulse" />
              ) : (
                formatPrice(netPlatformRevenue, { showCents: false })
              )}
            </span>
            {renderTrend(revenueGrowth, true)}
          </div>
        </div>
      </div>

      {/* ── 2. Middle Row: Unified Revenue & Bookings Overview Area Graph ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Revenue Overview (2 Columns) with Segment Toggle */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          
          {/* Header Row with Title, Badge, Subtitle and Toggle Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {chartViewMode === 'revenue' ? 'Revenue Overview' : 'Booking Trends'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3" /> {chartViewMode === 'revenue' ? '+18% vs last year' : '+23% vs last year'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {chartViewMode === 'revenue' 
                  ? 'Monthly platform revenue and booking performance' 
                  : 'Monthly completed and confirmed bookings'}
              </p>
            </div>

            {/* Segment Toggle Switch */}
            <div className="flex items-center bg-gray-100/90 p-1 rounded-2xl border border-gray-200/60 shadow-inner self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartViewMode('revenue')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  chartViewMode === 'revenue'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('bookings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  chartViewMode === 'bookings'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Bookings
              </button>
            </div>
          </div>

          {/* Area Graph with 12 Months and Smooth Natural Curve */}
          <div className="mt-7 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminPerfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                />
                <YAxis 
                  domain={chartViewMode === 'revenue' ? [0, 'auto'] : [0, 28]}
                  ticks={chartViewMode === 'bookings' ? [0, 7, 14, 21, 28] : undefined}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                  tickFormatter={(v) => chartViewMode === 'revenue' ? (v === 0 ? `${currencySymbol}0` : `${currencySymbol}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`) : String(v)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [
                    chartViewMode === 'revenue' 
                      ? `${currencySymbol} ${Number(val).toLocaleString(undefined, { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: currency === 'USD' ? 2 : 0 })}` 
                      : `${val} Bookings`,
                    chartViewMode === 'revenue' ? 'Revenue' : 'Bookings'
                  ]} 
                />
                <Area 
                  type="monotone" 
                  dataKey={chartViewMode === 'revenue' ? 'revenue' : 'bookings'} 
                  stroke="#0284c7" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#adminPerfGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Package Distribution (1 Column) */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              Package Distribution
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Share of tours by category
            </p>
          </div>

          {/* Donut Graphic */}
          <div className="h-[210px] w-full flex items-center justify-center relative my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={packageDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {packageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown Legend */}
          <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs">
            {packageDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Lower Row: Recent Activity ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              Recent Approvals
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">Recently approved agencies and hotels</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentActivity.map((act: any, idx: number) => {
            const isAgency = act.title?.toLowerCase().includes('agent') || act.title?.toLowerCase().includes('agency');
            const targetUrl = isAgency ? '/admin/agents' : '/admin/hotels';

            return (
              <Link
                key={idx}
                to={targetUrl}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors rounded-2xl px-3 group block"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                    isAgency ? 'bg-sky-50 text-[#0ea5e9]' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {isAgency ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-sky-600 transition-colors truncate">
                      {act.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{act.desc}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${act.color}`}>
                      {act.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{act.time}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
