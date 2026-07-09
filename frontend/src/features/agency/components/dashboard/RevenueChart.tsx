import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { api } from '@/features/agency/services/api';

export function RevenueChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analytics = await api.getAnalytics('yearly');
        if (analytics?.revenueData && analytics.revenueData.length > 0) {
          setData(analytics.revenueData.map(d => ({
            month: d.label,
            revenue: d.value,
          })));
        }
      } catch (error) {
        console.error('Failed to load revenue data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fallback to empty chart if no data
  const chartData = data.length > 0 ? data : [];

  return (
    <div className="h-[300px] w-full">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">No revenue data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187, 75%, 35%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(187, 75%, 35%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false}
              tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false}
              tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`} />
            <Area type="monotone" dataKey="revenue"
              stroke="hsl(187, 75%, 35%)" strokeWidth={2}
              fillOpacity={1} fill="url(#colorRevenue)"
              isAnimationActive={false} activeDot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
