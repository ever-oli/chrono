import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TimelineView from "@/components/Analytics/Timeline";
import { useTimerContext } from "@/components/Timer/TimerContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TimeRange = "hours" | "days" | "weeks" | "months";

export default function Timeline() {
  const [timeRange, setTimeRange] = useState<TimeRange>("hours");
  const { timers } = useTimerContext();

  // Fetch time entries
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          seconds,
          started_at,
          ended_at,
          timers (
            name,
            color
          )
        `)
        .order('started_at', { ascending: true });
      
      if (error) throw error;
      
      return data.map(entry => ({
        id: entry.id,
        name: entry.timers.name,
        color: entry.timers.color,
        started_at: entry.started_at,
        ended_at: entry.ended_at,
        seconds: entry.seconds
      }));
    }
  });

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="days">Days</TabsTrigger>
            <TabsTrigger value="weeks">Weeks</TabsTrigger>
            <TabsTrigger value="months">Months</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-card rounded-lg p-4">
        <TimelineView 
          entries={timeEntries} 
          view={timeRange}
        />
      </div>
    </div>
  );
}