import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnalyticsCharts from "@/components/Analytics/AnalyticsCharts";
import { format, parseISO } from "date-fns";

export default function Statement() {
  const [searchParams] = useSearchParams();
  const period = searchParams.get('period');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['statement-events', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          seconds,
          started_at,
          ended_at,
          name,
          notes,
          marker_size,
          timer:timers (
            id,
            name,
            color
          )
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Group events by timer
  const eventsByTimer = events.reduce((acc: any, event) => {
    const timerName = event.timer?.name || 'Unnamed Timer';
    if (!acc[timerName]) {
      acc[timerName] = [];
    }
    acc[timerName].push(event);
    return acc;
  }, {});

  // Prepare chart data
  const chartData = Object.entries(eventsByTimer).map(([timerName, timerEvents]: [string, any[]]) => ({
    name: timerName,
    hours: timerEvents.reduce((sum, event) => sum + event.seconds / 3600, 0),
    color: timerEvents[0].timer?.color || '#cccccc'
  }));

  return (
    <div className="p-8 max-w-4xl mx-auto chart-container">
      <h1 className="text-2xl font-bold mb-8">Time Statement - {period}</h1>
      <AnalyticsCharts data={chartData} />
    </div>
  );
}