import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface AnalyticsProps {
  timers: Array<{
    id: string;
    name: string;
    color: string;
    seconds: number;
  }>;
}

export default function Analytics({ timers }: AnalyticsProps) {
  // Filter out timers with 0 seconds
  const activeTimers = timers.filter((timer) => timer.seconds > 0);
  
  // Convert seconds to hours for better readability
  const pieData = activeTimers.map((timer) => ({
    name: timer.name,
    value: timer.seconds / 3600, // Convert to hours
    color: timer.color,
  }));

  // Create bar chart data - for now we'll show all timers in one day
  // In a future implementation, we can group by actual dates
  const barData = activeTimers.map((timer) => ({
    name: timer.name,
    hours: timer.seconds / 3600,
    color: timer.color,
  }));

  // If no data, show a message
  if (pieData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Start tracking time to see analytics
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="h-[300px] w-full">
        <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => 
                `${name}: ${value.toFixed(2)}h`
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}h`, 'Time Spent']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[300px] w-full">
        <h3 className="text-lg font-semibold mb-4">Time Per Activity</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
            />
            <YAxis 
              label={{ 
                value: 'Hours', 
                angle: -90, 
                position: 'insideLeft',
                className: "text-xs"
              }}
              className="text-xs"
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)}h`, 'Time Spent']}
            />
            <Bar 
              dataKey="hours"
              name="Hours Spent"
            >
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}