import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/types/timeEntry";
import { generateDateRange, getDayEntries } from "./utils/dateUtils";
import { Card } from "@/components/ui/card";
import MonthLabels from "./components/MonthLabels";
import DayLabels from "./components/DayLabels";
import GridContent from "./components/GridContent";

export default function HabitGrid() {
  const dates = generateDateRange();
  
  // Fetch all timers
  const { data: timers = [], isLoading: timersLoading } = useQuery({
    queryKey: ['timers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch time entries for the date range
  const { data: entries = [], isLoading: entriesLoading, error } = useQuery({
    queryKey: ['habit-entries', dates[0], dates[dates.length - 1]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          timer:timers (
            id,
            name,
            color
          )
        `)
        .gte('started_at', dates[0].toISOString())
        .lte('started_at', dates[dates.length - 1].toISOString())
        .order('started_at', { ascending: true });

      if (error) throw error;
      return data as TimeEntry[];
    }
  });

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        Error loading activity data. Please try again.
      </div>
    );
  }

  if (timersLoading || entriesLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {timers.map(timer => {
        // Filter entries for this specific timer
        const timerEntries = entries.filter(entry => entry.timer_id === timer.id);
        
        // Group entries by date for this timer
        const entriesByDate = dates.reduce((acc, date) => {
          acc[date.toISOString()] = getDayEntries(date, timerEntries);
          return acc;
        }, {} as Record<string, TimeEntry[]>);

        // Calculate maximum entries for intensity scaling
        const maxIntensity = Math.max(
          ...Object.values(entriesByDate).map(entries => 
            entries.reduce((sum, entry) => sum + (entry.seconds || 0), 0)
          )
        );

        // Create weeks array for the grid
        const weeks: Date[][] = [];
        let currentWeek: Date[] = [];

        dates.forEach(date => {
          if (date.getDay() === 0 && currentWeek.length > 0) {
            weeks.push([...currentWeek]);
            currentWeek = [];
          }
          
          currentWeek[date.getDay()] = date;
          
          if (date.getTime() === dates[dates.length - 1].getTime()) {
            while (currentWeek.length < 7) {
              currentWeek.push(new Date(0));
            }
            weeks.push([...currentWeek]);
          }
        });

        return (
          <Card key={timer.id} className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: timer.color }}
                />
                <h3 className="text-lg font-semibold">{timer.name} Activity</h3>
              </div>
              
              <div className="overflow-x-auto pb-4">
                <div className="relative">
                  <MonthLabels weeks={weeks} />
                  <div className="flex">
                    <DayLabels />
                    <GridContent 
                      weeks={weeks}
                      entriesByDate={entriesByDate}
                      maxIntensity={maxIntensity}
                      color={timer.color}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}