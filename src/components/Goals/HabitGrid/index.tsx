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
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {timers.map(timer => {
        const timerEntries = entries.filter(entry => entry.timer_id === timer.id);
        const entriesByDate = dates.reduce((acc, date) => {
          const dayEntries = getDayEntries(date, timerEntries);
          acc[date.toISOString()] = dayEntries;
          return acc;
        }, {} as Record<string, TimeEntry[]>);

        const maxIntensity = Math.max(
          ...Object.values(entriesByDate).map(entries => 
            entries.reduce((sum, entry) => sum + (entry.seconds || 0), 0)
          )
        );

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
          <Card 
            key={timer.id} 
            className="p-3 md:p-component hover:shadow-card transition-shadow rounded-lg border border-border/5"
          >
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div 
                  className="w-2 h-2 md:w-3 md:h-3 rounded-full" 
                  style={{ backgroundColor: timer.color }}
                />
                <h3 className="text-base md:text-lg font-semibold">{timer.name}</h3>
              </div>
              
              <div className="min-w-0 w-full">
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