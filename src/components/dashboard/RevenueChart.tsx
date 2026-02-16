import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000, trips: 24 },
  { month: "Feb", revenue: 3200, trips: 18 },
  { month: "Mar", revenue: 5800, trips: 32 },
  { month: "Apr", revenue: 4900, trips: 28 },
  { month: "May", revenue: 6200, trips: 35 },
  { month: "Jun", revenue: 7100, trips: 42 },
  { month: "Jul", revenue: 8400, trips: 48 },
  { month: "Aug", revenue: 7800, trips: 45 },
  { month: "Sep", revenue: 6500, trips: 38 },
  { month: "Oct", revenue: 5900, trips: 34 },
  { month: "Nov", revenue: 6800, trips: 40 },
  { month: "Dec", revenue: 9200, trips: 52 },
];

export function RevenueChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(187, 75%, 35%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(187, 75%, 35%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(214, 25%, 90%)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px -4px hsl(215 25% 15% / 0.1)",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(187, 75%, 35%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
