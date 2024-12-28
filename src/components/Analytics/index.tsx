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

export default function Analytics({ timeRange, currentDate }: AnalyticsProps) {
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

  // Fetch time entries for the selected period with proper filtering
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['timeEntries', dateRange.start, dateRange.end],
    queryFn: async () => {
      console.log('Fetching entries for range:', {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      });

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
        .or(
          `and(started_at.lte.${dateRange.end.toISOString()},ended_at.gte.${dateRange.start.toISOString()}),` +
          `and(started_at.lte.${dateRange.end.toISOString()},ended_at.is.null)`
        )
        .order('started_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }

      console.log('Fetched entries:', data);
      return data;
    }
  });

  // Aggregate data by timer
  const aggregatedData = useMemo(() => {
    const timerMap = new Map<string, { name: string; color: string; seconds: number }>();
    
    timeEntries.forEach(entry => {
      const timer = entry.timers;
      const current = timerMap.get(timer.id) || { 
        name: timer.name, 
        color: timer.color, 
        seconds: 0 
      };
      
      timerMap.set(timer.id, {
        ...current,
        seconds: current.seconds + entry.seconds
      });
    });

    return Array.from(timerMap.values());
  }, [timeEntries]);

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