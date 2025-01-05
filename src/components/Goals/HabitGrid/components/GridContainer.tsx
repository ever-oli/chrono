import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/types/timeEntry";
import { Timer } from "@/types/timer";
import { generateDateRange } from "../utils/dateUtils";
import MonthLabels from "./MonthLabels";
import DayLabels from "./DayLabels";
import GridContent from "./GridContent";
import { useToast } from "@/components/ui/use-toast";

export default function GridContainer() {
  const { toast } = useToast();
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

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
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
    },
    meta: {
      onSuccess: (data) => {
        toast({
          title: "Time Entries Loaded",
          description: `Found ${data.length} entries`
        });
      }
    }
  });

  if (timersLoading || entriesLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timers.map((timer) => (
        <div 
          key={timer.id}
          className="p-6 bg-white rounded-lg border shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: timer.color }}
            />
            <h3 className="text-lg font-semibold">{timer.name}</h3>
          </div>
          
          <div className="min-w-0 w-full">
            <div className="relative">
              <MonthLabels dates={dates} />
              <div className="flex">
                <DayLabels />
                <GridContent 
                  dates={dates}
                  entries={entries.filter(entry => entry.timer_id === timer.id)}
                  color={timer.color}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}