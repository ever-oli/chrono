import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import _ from "lodash";

interface Timer {
  id: string;
  name: string;
  color: string;
}

export function useAnalyticsData(dateRange: { start: Date; end: Date }) {
  return useQuery({
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

      const aggregatedData = _.chain(data)
        .groupBy(entry => entry.timers.id)
        .map((entries, timerId) => ({
          name: entries[0].timers.name,
          color: entries[0].timers.color,
          seconds: _.sumBy(entries, 'seconds')
        }))
        .value();

      return {
        rawData: data,
        aggregatedData,
        chartData: aggregatedData.map(timer => ({
          name: timer.name,
          hours: timer.seconds / 3600,
          color: timer.color
        })),
        pieChartData: aggregatedData.map(timer => ({
          name: timer.name,
          value: timer.seconds / 3600,
          color: timer.color
        }))
      };
    }
  });
}