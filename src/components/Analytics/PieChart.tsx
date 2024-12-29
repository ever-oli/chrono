import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

// Helper function to determine if we should use light or dark text
const shouldUseLightText = (backgroundColor: string) => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

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
            label={({ name, value, fill }) => (
              <text
                x={0}
                y={0}
                fill={shouldUseLightText(fill) ? "#FFFFFF" : "#000000"}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  textShadow: shouldUseLightText(fill) 
                    ? '0px 1px 2px rgba(0,0,0,0.5)'
                    : '0px 1px 2px rgba(255,255,255,0.5)'
                }}
              >
                {`${name}: ${value.toFixed(2)}h`}
              </text>
            )}
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