import { TimeEntry } from "@/types/timeEntry";
import { format } from "date-fns";

interface GridTooltipProps {
  date: Date;
  entries: TimeEntry[];
}

export default function GridTooltip({ date, entries }: GridTooltipProps) {
  const totalSeconds = entries.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return (
    <div className="p-2">
      <p className="font-semibold">{format(date, 'MMMM d, yyyy')}</p>
      <p className="text-sm text-muted-foreground">
        {entries.length} {entries.length === 1 ? 'activity' : 'activities'}
      </p>
      <p className="text-sm text-muted-foreground">
        Total: {hours}h {minutes}m
      </p>
    </div>
  );
}