import PieChart from "./PieChart";
import BarChart from "./BarChart";

interface AnalyticsProps {
  timers: Array<{
    id: string;
    name: string;
    color: string;
    seconds: number;
  }>;
}

export default function Analytics({ timers }: AnalyticsProps) {
  const activeTimers = timers.filter((timer) => timer.seconds > 0);
  
  const pieData = activeTimers.map((timer) => ({
    name: timer.name,
    value: timer.seconds / 3600,
    color: timer.color,
  }));

  const barData = activeTimers.map((timer) => ({
    name: timer.name,
    hours: timer.seconds / 3600,
    color: timer.color,
  }));

  if (pieData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Start tracking time to see analytics
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PieChart data={pieData} />
      <BarChart data={barData} />
    </div>
  );
}