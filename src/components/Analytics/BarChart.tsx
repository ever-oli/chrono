import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { formatDuration } from "@/utils/dateFormatters";

interface BarChartProps {
  data: Array<{
    name: string;
    hours: number;
    color: string;
  }>;
}

export default function BarChart({ data }: BarChartProps) {
  return (
    <div className="h-[300px] w-full">
      <h3 className="text-lg font-semibold mb-4">Time Per Activity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs"
          />
          <YAxis 
            label={{ 
              value: 'Time (hours)', 
              angle: -90, 
              position: 'insideLeft',
              className: "text-xs"
            }}
            className="text-xs"
          />
          <Tooltip
            formatter={(value: number) => {
              const seconds = Math.floor(value * 3600); // Convert hours back to seconds
              return [formatDuration(seconds), 'Time Spent'];
            }}
          />
          <Bar 
            dataKey="hours"
            name="Time Spent"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}