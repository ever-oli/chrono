import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimeEntry } from "@/types/timeEntry";
import HabitGridTooltip from "./HabitGridTooltip";

interface HabitGridCellProps {
  date: Date;
  entries: TimeEntry[];
  intensity: number;
}

export default function HabitGridCell({ date, entries, intensity }: HabitGridCellProps) {
  const primaryColor = entries.length > 0 
    ? entries.reduce((prev, current) => 
        (current.seconds || 0) > (prev.seconds || 0) ? current : prev
      ).timer?.color 
    : '#E5E5E5';
  
  const opacity = Math.min(0.2 + (intensity * 0.8), 1);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110 hover:ring-2 ring-oxford-blue"
          style={{ 
            backgroundColor: primaryColor,
            opacity: entries.length > 0 ? opacity : 0.1
          }}
        />
      </TooltipTrigger>
      <TooltipContent>
        <HabitGridTooltip date={date} entries={entries} />
      </TooltipContent>
    </Tooltip>
  );
}