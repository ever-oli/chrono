import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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
  const data = activeTimers.map((timer) => ({
    name: timer.name,
    value: timer.seconds / 3600, // Convert to hours
    color: timer.color,
  }));

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Start tracking time to see analytics
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}