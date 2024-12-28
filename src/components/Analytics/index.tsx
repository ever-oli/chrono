import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  isWithinInterval
} from "date-fns";

interface Timer {
  id: string;
  name: string;
  color: string;
  seconds: number;
}

interface AnalyticsProps {
  timers: Timer[];
  timeRange: "hours" | "days" | "weeks" | "months";
  currentDate: Date;
}

export default function Analytics({ timers, timeRange, currentDate }: AnalyticsProps) {
  // Get date range based on selected time period
  const dateRange = useMemo(() => {
    switch (timeRange) {
      case "hours":
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate)
        };
      case "days":
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        };
      case "weeks":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      case "months":
        return {
          start: startOfYear(currentDate),
          end: endOfYear(currentDate)
        };
    }
  }, [timeRange, currentDate]);

  // Fetch time entries for the selected period
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['timeEntries', dateRange.start, dateRange.end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          seconds,
          started_at,
          ended_at,
          timers (
            id,
            name,
            color
          )
        `)
        .gte('started_at', dateRange.start.toISOString())
        .lte('started_at', dateRange.end.toISOString())
        .order('started_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Filter and aggregate time entries based on time range
  const aggregatedData = useMemo(() => {
    const timerMap = new Map<string, { name: string; color: string; seconds: number }>();
    
    timeEntries.forEach(entry => {
      const entryDate = new Date(entry.started_at);
      const timer = entry.timers;

      // Only include entries that fall within the selected time range
      if (isWithinInterval(entryDate, { start: dateRange.start, end: dateRange.end })) {
        const current = timerMap.get(timer.id) || { 
          name: timer.name, 
          color: timer.color, 
          seconds: 0 
        };
        
        timerMap.set(timer.id, {
          ...current,
          seconds: current.seconds + entry.seconds
        });
      }
    });

    return Array.from(timerMap.values());
  }, [timeEntries, dateRange]);

  // Transform data for charts
  const chartData = useMemo(() => 
    aggregatedData.map(timer => ({
      name: timer.name,
      hours: timer.seconds / 3600,
      color: timer.color
    })),
    [aggregatedData]
  );

  // Transform data specifically for pie chart
  const pieChartData = useMemo(() => 
    chartData.map(item => ({
      name: item.name,
      value: item.hours,
      color: item.color
    })),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No data available for this time period
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PieChart data={pieChartData} />
        <BarChart data={chartData} />
      </div>
    </div>
  );
}