import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimeEntry } from "@/types/timeEntry";
import HabitGridTooltip from "../HabitGridTooltip";
import { calculateIntensity } from "../utils/dateUtils";

interface GridContentProps {
  weeks: Date[][];
  entriesByDate: Record<string, TimeEntry[]>;
  maxIntensity: number;
}

export default function GridContent({ weeks, entriesByDate, maxIntensity }: GridContentProps) {
  return (
    <div className="grid grid-cols-53 grid-rows-7 gap-[1px]">
      {weeks.map((week, weekIndex) => (
        week.map((date, dayIndex) => {
          if (date.getTime() === 0) return (
            <div key={`empty-${weekIndex}-${dayIndex}`} className="w-3 h-3" />
          );
          
          const dayEntries = entriesByDate[date.toISOString()] || [];
          const intensity = maxIntensity > 0 
            ? calculateIntensity(dayEntries) / maxIntensity 
            : 0;
          
          // Get the most active timer's color
          const primaryColor = dayEntries.length > 0 
            ? dayEntries.reduce((prev, current) => 
                (current.seconds || 0) > (prev.seconds || 0) ? current : prev
              ).timer?.color 
            : '#e5e5e5';
          
          // Calculate opacity based on intensity
          const opacity = Math.min(0.2 + (intensity * 0.8), 1);
          
          return (
            <Tooltip key={date.toISOString()}>
              <TooltipTrigger asChild>
                <div 
                  className="w-3 h-3 rounded-sm cursor-pointer transition-colors"
                  style={{ 
                    backgroundColor: primaryColor,
                    opacity: dayEntries.length > 0 ? opacity : 0.1
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <HabitGridTooltip date={date} entries={dayEntries} />
              </TooltipContent>
            </Tooltip>
          );
        })
      ))}
    </div>
  );
}