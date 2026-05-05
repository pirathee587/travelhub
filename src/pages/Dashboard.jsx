import React, { useEffect, useState, useCallback } from 'react';
import adminDashboardApi from '../api/admin/adminDashboardApi';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const fmtCurrency = (n) => {
  if (n == null) return '—';
  return `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatsCard = ({ icon, title, value, sub, subColor = "text-emerald-500", bgColor, loading }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm flex justify-between items-start border border-gray-100">
    <div>
      <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
      {loading ? (
        <div className="h-9 w-24 bg-gray-100 rounded animate-pulse mb-2" />
      ) : (
        <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      )}
      {sub && (
        <div className={`text-xs font-medium ${subColor}`}>{sub}</div>
      )}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${bgColor}`}>
      {icon}
    </div>
  </div>
);

const PendingBox = ({ label, value, loading }) => (
  <div className="px-4 py-3 bg-white rounded-xl shadow-sm min-w-[80px] text-center flex flex-col justify-center">
    <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
    {loading ? (
      <div className="h-7 w-10 mx-auto bg-gray-100 rounded animate-pulse" />
    ) : (
      <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminDashboardApi.getDashboard();
      setStats(res?.data ?? res);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalPending =
    (stats?.pendingAgents   ?? 0) +
    (stats?.pendingHotels   ?? 0) +
    (stats?.pendingPackages ?? 0) +
    (stats?.pendingBookings ?? 0);

  // Mock data for charts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const bookingData = [30, 45, 50, 48, 60, 75];
  const maxBooking = Math.max(...bookingData);

  const recentActivity = [
    { title: 'New agent registration', desc: 'Pinnacle Tours', status: 'Pending', time: '2 min ago', icon: '👤', color: 'bg-orange-100 text-orange-700' },
    { title: 'Hotel approved', desc: 'Cinnamon Lakeside', status: 'Approved', time: '15 min ago', icon: '🏢', color: 'bg-[#ccfbf1] text-[#0f766e]' },
    { title: 'Package rejected', desc: 'Extreme Rafting', status: 'Rejected', time: '1 hour ago', icon: '📦', color: 'bg-red-100 text-red-700' },
    { title: 'Booking completed', desc: 'BK-2024-001', status: 'Completed', time: '2 hours ago', icon: '📅', color: 'bg-[#ccfbf1] text-[#0f766e]' },
  ];

  const packageDistribution = [
    { label: 'Cultural Tours', value: 38, color: '#10b981' },
    { label: 'Adventure', value: 28, color: '#eab308' },
    { label: 'Beach Tours', value: 20, color: '#f97316' },
    { label: 'Wildlife Safari', value: 18, color: '#3b82f6' },
    { label: 'Wellness', value: 8, color: '#ec4899' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">

      {/* ── Welcome Banner ───────────────────────────────────────────────── */}
      <div className="bg-[#148671] rounded-xl p-8 text-white shadow-sm">
        <div className="text-sm font-medium opacity-90 mb-1">Welcome back, Admin</div>
        <h1 className="text-3xl font-bold mb-2">Travel Hub Dashboard</h1>
        <p className="text-sm opacity-90 max-w-lg">
          Manage and monitor Sri Lanka's tourism ecosystem from one powerful platform
        </p>
      </div>

      {/* ── Pending Approvals ────────────────────────────────────────────── */}
      <div className="bg-[#fff7ed] border border-orange-100 rounded-xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">⏰</div>
          <div>
            <div className="text-lg font-bold text-gray-900">Pending Approvals</div>
            <div className="text-gray-500 text-sm mt-0.5">
              {loading ? '...' : `${totalPending} items require your attention`}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <PendingBox label="Agents"   value={stats?.pendingAgents}   loading={loading} />
          <PendingBox label="Hotels"   value={stats?.pendingHotels}   loading={loading} />
          <PendingBox label="Packages" value={stats?.pendingPackages} loading={loading} />
          <PendingBox label="Bookings" value={stats?.pendingBookings} loading={loading} />
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div><div className="font-semibold text-red-700">Error</div><div className="text-sm text-red-600">{error}</div></div>
          </div>
          <button onClick={load} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700">Retry</button>
        </div>
      )}

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          loading={loading}
          title="Total Users"
          value={fmt(stats?.totalUsers)}
          sub="+12% from last month"
          icon="👥"
          bgColor="bg-[#ccfbf1]"
        />
        <StatsCard
          loading={loading}
          title="Active Agents"
          value={fmt(stats?.totalAgents)}
          sub="+8% from last month"
          icon="📈"
          bgColor="bg-[#e0f2fe]"
        />
        <StatsCard
          loading={loading}
          title="Partner Hotels"
          value={fmt(stats?.totalHotels)}
          sub="+5% from last month"
          icon="🏢"
          bgColor="bg-[#ccfbf1]"
        />
        <StatsCard
          loading={loading}
          title="Active Packages"
          value={fmt(stats?.totalPackages)}
          sub="+15% from last month"
          icon="📦"
          bgColor="bg-[#fef08a]"
        />
        <StatsCard
          loading={loading}
          title="Total Bookings"
          value={fmt(stats?.totalBookings)}
          sub="+23% from last month"
          icon="📅"
          bgColor="bg-[#ccfbf1]"
        />
        <StatsCard
          loading={loading}
          title="Monthly Revenue"
          value={fmtCurrency(stats?.totalRevenue)}
          sub="+18% from last month"
          icon="💰"
          bgColor="bg-[#fce7f3]"
        />
      </div>

      {/* ── Bottom Section Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Booking Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Booking Trends</h3>
          <div className="flex-1 flex items-end justify-between gap-3 px-4">
            {bookingData.map((val, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-3 h-full justify-end">
                <div className="w-full bg-[#14b8a6] rounded-sm" style={{ height: `${(val / maxBooking) * 160}px` }} />
                <span className="text-xs font-medium text-gray-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Revenue Overview</h3>
          <div className="flex-1 flex items-end justify-between gap-3 px-4">
            {months.map((m, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-3 h-full justify-end">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                <span className="text-xs font-medium text-gray-400">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg">{act.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{act.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{act.desc}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${act.color}`}>
                    {act.status}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 text-sm text-gray-500 font-medium hover:text-gray-900 transition">
            View All Activity →
          </button>
        </div>

        {/* Package Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Package Distribution</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Donut Chart */}
            <div className="flex justify-center mb-8">
              <svg viewBox="0 0 100 100" className="w-52 h-52">
                {(() => {
                  const total = packageDistribution.reduce((sum, p) => sum + p.value, 0);
                  const r = 35;
                  const cx = 50;
                  const cy = 50;
                  const circ = 2 * Math.PI * r;
                  let offset = 0;
                  return packageDistribution.map((s, i) => {
                    const dash = (s.value / total) * circ;
                    const gap = circ - dash;
                    const el = (
                      <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="22"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
                <circle cx="50" cy="50" r="24" fill="white" />
              </svg>
            </div>
            {/* Legend */}
            <div className="space-y-3 px-8 w-full max-w-xs mx-auto">
              {packageDistribution.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-medium text-gray-600 flex-1">{p.label}</span>
                  <span className="text-sm font-bold text-gray-600">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
