import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDay, isSameMonth, startOfWeek } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import { generateDateRange, getDayEntries } from "./utils/dateUtils";
import { useState, useEffect } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import MonthLabels from "./components/MonthLabels";
import DayLabels from "./components/DayLabels";
import GridContent from "./components/GridContent";

export default function HabitGrid() {
  const [showDebug, setShowDebug] = useState(false);
  const dates = generateDateRange();
  
  // Toggle debug panel with Alt+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: entries = [], isLoading, error } = useQuery({
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

  // Group entries by date
  const entriesByDate = dates.reduce((acc, date) => {
    acc[date.toISOString()] = getDayEntries(date, entries);
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
    const dayOfWeek = getDay(date);
    
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
    
    currentWeek[dayOfWeek] = date;
    
    if (date.getTime() === dates[dates.length - 1].getTime()) {
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(0));
      }
      weeks.push([...currentWeek]);
    }
  });

  if (error) {
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

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Activity Grid</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDebug(prev => !prev)}
            title="Toggle Debug Panel (Alt+D)"
            className="border-2 border-primary hover:bg-primary/10"
          >
            <Bug className="h-4 w-4" />
          </Button>
        </div>
        
        {showDebug && (
          <div className="border-2 rounded-lg p-4 bg-muted/50 space-y-4">
            <h3 className="font-medium">Debug Information</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 text-sm">
                <p>Date Range: {dates[0].toLocaleDateString()} - {dates[dates.length - 1].toLocaleDateString()}</p>
                <p>Total Entries: {entries.length}</p>
                <p>Max Intensity: {maxIntensity}</p>
                <p>Days with Activity: {Object.values(entriesByDate).filter(e => e.length > 0).length}</p>
                <div>
                  <p className="font-medium">Recent Entries:</p>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {JSON.stringify(entries.slice(-3), null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
        
        <div className="overflow-x-auto pb-4">
          <div className="relative">
            <MonthLabels weeks={weeks} />
            <div className="flex">
              <DayLabels />
              <GridContent 
                weeks={weeks}
                entriesByDate={entriesByDate}
                maxIntensity={maxIntensity}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
