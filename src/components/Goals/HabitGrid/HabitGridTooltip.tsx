import { format } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";

interface HabitGridTooltipProps {
  date: Date;
  entries: TimeEntry[];
}

export default function HabitGridTooltip({ date, entries }: HabitGridTooltipProps) {
  const totalDuration = entries.reduce((acc, entry) => acc + entry.seconds, 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

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
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.timer?.color }}
            />
            <span>{entry.timer?.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}