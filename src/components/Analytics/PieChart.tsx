import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const RADIAN = Math.PI / 180;

export default function PieChart({ data }: PieChartProps) {
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    value,
  }: any) => {
    const radius = outerRadius * 0.85; // Adjusted from 1.35 to 0.85
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Determine text anchor based on position in the circle
    const textAnchor = x > cx ? 'start' : 'end';

    return (
      <text
        x={x}
        y={y}
        fill="#030027"
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${name}: ${value.toFixed(1)}h`}
      </text>
    );
  };

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
            labelLine={false}
            label={renderCustomizedLabel}
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