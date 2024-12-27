import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function PieChart({ data }: PieChartProps) {
  return (
    <div className="h-[300px] w-full">
      <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, value }) => 
              `${name}: ${value.toFixed(2)}h`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)}h`, 'Time Spent']}
          />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
}