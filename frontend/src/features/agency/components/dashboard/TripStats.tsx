import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { api } from '@/features/agency/services/api';

const COLORS = {
  Completed: 'hsl(152, 60%, 42%)',
  Active:    'hsl(187, 75%, 35%)',
  Pending:   'hsl(38, 92%, 55%)',
  Cancelled: 'hsl(0, 72%, 55%)',
};

export function TripStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analytics = await api.getAnalytics('monthly');
        if (analytics?.tripStatusData) {
          const t = analytics.tripStatusData;
          setData([
            { name: 'Completed', value: t.completed ?? 0, color: COLORS.Completed },
            { name: 'Active',    value: t.active ?? 0,    color: COLORS.Active },
            { name: 'Pending',   value: t.pending ?? 0,   color: COLORS.Pending },
            { name: 'Cancelled', value: t.cancelled ?? 0, color: COLORS.Cancelled },
          ]);
        }
      } catch (error) {
        console.error('Failed to load trip stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasData = data.some(d => d.value > 0);

  return (
    <div className="h-[280px] w-full">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading stats...</p>
        </div>
      ) : !hasData ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">No trip data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="45%"
              innerRadius={60} outerRadius={90}
              paddingAngle={4} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span className="text-sm text-muted-foreground">
                  {value}: {entry.payload.value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
