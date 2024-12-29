import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { eachDayOfInterval, subDays, startOfDay, endOfDay } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import HabitGridCell from "./HabitGridCell";

export default function HabitGrid() {
  console.log("HabitGrid component rendering");
  
  const endDate = new Date();
  const startDate = subDays(endDate, 364); // Last 365 days
  const dates = eachDayOfInterval({ start: startDate, end: endDate });

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['habit-entries', startDate, endDate],
    queryFn: async () => {
      console.log("Fetching habit entries...", { startDate, endDate });
      
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
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .order('started_at', { ascending: true });

      console.log("Habit entries response:", { data, error });

      if (error) throw error;
      return data as TimeEntry[];
    }
  });

  if (error) {
    console.error("Error loading habit entries:", error);
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        Error loading activity data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  // Group entries by date
  const entriesByDate = dates.reduce((acc, date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.started_at);
      return entryDate >= dayStart && entryDate <= dayEnd;
    });

    acc[date.toISOString()] = dayEntries;
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  console.log("Grouped entries by date:", entriesByDate);

  // Calculate maximum entries per day for intensity scaling
  const maxEntries = Math.max(
    ...Object.values(entriesByDate).map(entries => entries.length)
  );

  console.log("Max entries per day:", maxEntries);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Activity Grid</h2>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-53 gap-1 min-w-[800px]">
          {dates.map(date => {
            const dayEntries = entriesByDate[date.toISOString()] || [];
            const intensity = maxEntries > 0 ? dayEntries.length / maxEntries : 0;
            
            return (
              <HabitGridCell
                key={date.toISOString()}
                date={date}
                entries={dayEntries}
                intensity={intensity}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}