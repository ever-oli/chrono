import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  eachDayOfInterval, 
  subDays, 
  startOfDay, 
  endOfDay, 
  format,
  getDay,
  isSameMonth,
  startOfWeek
} from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import HabitGridCell from "./HabitGridCell";
import { useState, useEffect } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitGrid() {
  const [showDebug, setShowDebug] = useState(false);
  
  const endDate = new Date();
  const startDate = subDays(endDate, 364); // Last 365 days
  const dates = eachDayOfInterval({ start: startDate, end: endDate });

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
                <p>Date Range: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</p>
                <p>Total Entries: {entries.length}</p>
                <p>Max Seconds Per Day: {maxEntries}</p>
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
            {/* Month labels */}
            <div className="flex mb-2 text-sm text-muted-foreground">
              <div className="w-8" /> {/* Spacer for day labels */}
              <div className="flex-1 flex">
                {weeks.map((week, i) => {
                  const date = week[0];
                  const showMonth = i === 0 || !isSameMonth(weeks[i-1][0], date);
                  return (
                    <div key={i} className="w-3 mx-[1px]">
                      {showMonth && (
                        <div className="absolute -top-6">
                          {format(date, 'MMM')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid with day labels */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col mr-2 text-sm text-muted-foreground">
                {DAYS.map((day, i) => (
                  <div key={day} className="h-3 flex items-center">
                    {i % 2 === 0 && day}
                  </div>
                ))}
              </div>

              {/* Activity grid */}
              <div className="grid grid-cols-53 grid-rows-7 gap-[1px]">
                {weeks.map((week, weekIndex) => (
                  week.map((date, dayIndex) => {
                    if (date.getTime() === 0) return (
                      <div key={`empty-${weekIndex}-${dayIndex}`} className="w-3 h-3" />
                    );
                    
                    const dayEntries = entriesByDate[date.toISOString()] || [];
                    const totalSeconds = dayEntries.reduce((sum, entry) => 
                      sum + (entry.seconds || 0), 0
                    );
                    const intensity = maxEntries > 0 ? totalSeconds / maxEntries : 0;
                    
                    return (
                      <HabitGridCell
                        key={date.toISOString()}
                        date={date}
                        entries={dayEntries}
                        intensity={intensity}
                      />
                    );
                  })
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}