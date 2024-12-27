import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import Timeline from "./Timeline";

interface Timer {
  id: string;
  name: string;
  color: string;
  seconds: number;
}

interface AnalyticsProps {
  timers: Timer[];
}

export default function Analytics({ timers }: AnalyticsProps) {
  const totalSeconds = useMemo(() => 
    timers.reduce((acc, timer) => acc + timer.seconds, 0),
    [timers]
  );

  const chartData = useMemo(() => 
    timers.map(timer => ({
      name: timer.name,
      hours: timer.seconds / 3600,
      color: timer.color
    })),
    [timers]
  );

  // Transform chartData for PieChart to match its expected props type
  const pieChartData = useMemo(() => 
    chartData.map(item => ({
      name: item.name,
      value: item.hours,
      color: item.color
    })),
    [chartData]
  );

  // Fetch time entries for the timeline
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          seconds,
          started_at,
          ended_at,
          timers (
            name,
            color
          )
        `)
        .order('started_at', { ascending: true });
      
      if (error) throw error;
      
      return data.map(entry => ({
        id: entry.id,
        name: entry.timers.name,
        color: entry.timers.color,
        started_at: entry.started_at,
        ended_at: entry.ended_at,
        seconds: entry.seconds
      }));
    }
  });

  if (totalSeconds === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No data available yet. Start tracking time to see analytics.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PieChart data={pieChartData} />
        <BarChart data={chartData} />
      </div>
      <div className="mt-8">
        <Timeline entries={timeEntries} />
      </div>
    </div>
  );
}