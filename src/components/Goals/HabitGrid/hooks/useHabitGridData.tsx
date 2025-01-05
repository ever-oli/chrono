import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/types/timeEntry";
import { Timer } from "@/types/timer";
import { generateDateRange } from "../utils/dateUtils";

export function useHabitGridData() {
  const dates = generateDateRange();
  
  const { data: timers = [], isLoading: timersLoading } = useQuery({
    queryKey: ['timers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .order('created_at');
      
      if (error) {
        console.error('Error fetching timers:', error);
        throw error;
      }
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

      if (error) {
        console.error('Error fetching entries:', error);
        throw error;
      }
      return data as TimeEntry[];
    }
  });

  return {
    timers,
    entries,
    dates,
    isLoading: timersLoading || entriesLoading,
    error
  };
}