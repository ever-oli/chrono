import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimeEntry } from "@/types/timeEntry";
import { GridContentProps } from "@/types/habitGrid";
import GridTooltip from "./GridTooltip";

export default function GridContent({ weeks, entriesByDate, maxIntensity, color }: GridContentProps) {
  return (
    <div className="grid grid-cols-[repeat(53,1fr)] gap-1">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-rows-7 gap-1">
          {week.map((date, dayIndex) => {
            const dayEntries = entriesByDate[date.toISOString()] || [];
            const totalSeconds = dayEntries.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
            const intensity = totalSeconds / maxIntensity;
            
            return (
              <Tooltip key={dayIndex}>
                <TooltipTrigger asChild>
                  <div 
                    className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: color,
                      opacity: dayEntries.length > 0 ? 0.4 + (0.6 * intensity) : 0.1
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <GridTooltip 
                    date={date}
                    entries={dayEntries}
                  />
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
}