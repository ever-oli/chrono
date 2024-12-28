import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import _ from "lodash";

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

// Format time for display
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

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

  // Fetch time entries for the selected period with simplified filtering
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
        .gte('started_at', dateRange.start.toISOString())
        .lte('started_at', dateRange.end.toISOString())
        .order('started_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }

      console.log('Fetched entries:', data);
      return data;
    }
  });

  // Aggregate data by timer using lodash
  const aggregatedData = useMemo(() => {
    return _.chain(timeEntries)
      .groupBy(entry => entry.timers.id)
      .map((entries, timerId) => ({
        name: entries[0].timers.name,
        color: entries[0].timers.color,
        seconds: _.sumBy(entries, 'seconds')
      }))
      .value();
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
      
      <div className="space-y-2">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 bg-secondary rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium">{item.name}</span>
            </div>
            <span>{formatTime(item.hours * 3600)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}