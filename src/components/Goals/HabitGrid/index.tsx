import { getDayEntries } from "./utils/dateUtils";
import { Card } from "@/components/ui/card";
import GridContent from "./components/GridContent";
import { useHabitGridData } from "./hooks/useHabitGridData";
import { TimeEntry } from "@/types/timeEntry";

export default function HabitGrid() {
  const { timers, entries, dates, isLoading, error } = useHabitGridData();
  
  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        Error loading activity data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Each column represents a week, with dots arranged vertically from Sunday (top) to Saturday (bottom).
      </div>
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
            className="p-component hover:shadow-card transition-shadow rounded-lg border border-border/5"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: timer.color }}
                />
                <h3 className="text-lg font-semibold">{timer.name}</h3>
              </div>
              
              <div className="min-w-0 w-full">
                <div className="relative">
                  <GridContent 
                    weeks={weeks}
                    entriesByDate={entriesByDate}
                    maxIntensity={maxIntensity}
                    color={timer.color}
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}