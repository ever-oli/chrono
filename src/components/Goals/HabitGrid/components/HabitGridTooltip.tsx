import { format } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";

interface HabitGridTooltipProps {
  date: Date;
  entries: TimeEntry[];
}

export default function HabitGridTooltip({ date, entries }: HabitGridTooltipProps) {
  // Group entries by timer and calculate total seconds for each
  const timerSummary = entries.reduce((acc, entry) => {
    const timerId = entry.timer?.id || 'unknown';
    if (!acc[timerId]) {
      acc[timerId] = {
        name: entry.timer?.name || 'Unknown Timer',
        color: entry.timer?.color || '#e5e5e5',
        seconds: 0
      };
    }
    acc[timerId].seconds += entry.seconds || 0;
    return acc;
  }, {} as Record<string, { name: string; color: string; seconds: number }>);

  const totalSeconds = entries.reduce((acc, entry) => acc + (entry.seconds || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return (
    <div className="p-2 max-w-xs">
      <p className="font-semibold">{format(date, 'MMMM d, yyyy')}</p>
      <p className="text-sm text-muted-foreground">
        {entries.length} {entries.length === 1 ? 'activity' : 'activities'}
      </p>
      <p className="text-sm text-muted-foreground">
        Total: {hours}h {minutes}m
      </p>
      <div className="mt-2 space-y-1">
        {Object.values(timerSummary).map(({ name, color, seconds }) => {
          const timerHours = Math.floor(seconds / 3600);
          const timerMinutes = Math.floor((seconds % 3600) / 60);
          
          return (
            <div key={name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span>{name}</span>
              </div>
              <span className="text-muted-foreground">
                {timerHours}h {timerMinutes}m
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}