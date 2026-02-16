import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Completed", value: 156, color: "hsl(152, 60%, 42%)" },
  { name: "Active", value: 24, color: "hsl(187, 75%, 35%)" },
  { name: "Pending", value: 18, color: "hsl(38, 92%, 55%)" },
  { name: "Cancelled", value: 8, color: "hsl(0, 72%, 55%)" },
];

export function TripStats() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-sm text-muted-foreground">
                {value}: {entry.payload.value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
