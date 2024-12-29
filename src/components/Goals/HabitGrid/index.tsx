import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { eachDayOfInterval, subDays, startOfDay, endOfDay } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import HabitGridCell from "./HabitGridCell";

export default function HabitGrid() {
  const endDate = new Date();
  const startDate = subDays(endDate, 364); // Last 365 days
  const dates = eachDayOfInterval({ start: startDate, end: endDate });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['habit-entries', startDate, endDate],
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
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .order('started_at', { ascending: true });

      if (error) throw error;
      return data as TimeEntry[];
    }
  });

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

  // Calculate maximum entries per day for intensity scaling
  const maxEntries = Math.max(
    ...Object.values(entriesByDate).map(entries => entries.length)
  );

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