import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimeEntry } from "@/types/timeEntry";
import { GridContentProps } from "@/types/habitGrid";
import HabitGridTooltip from "../HabitGridTooltip";
import { calculateIntensity } from "../utils/gridCalculations";

export default function GridContent({ weeks, entriesByDate, maxIntensity, color }: GridContentProps) {
  return (
    <div className="grid grid-cols-[repeat(53,1fr)] gap-1">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-rows-7 gap-1">
          {week.map((date, dayIndex) => {
            // Skip rendering for invalid dates (new Date(0) or undefined)
            if (!date || date.getTime() === 0) {
              return (
                <div 
                  key={dayIndex}
                  className="w-3 h-3 rounded-sm"
                  style={{ 
                    backgroundColor: color,
                    opacity: 0.1
                  }}
                />
              );
            }

            const dayEntries = entriesByDate[date.toISOString()] || [];
            const totalSeconds = dayEntries.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
            const intensity = calculateIntensity(totalSeconds, maxIntensity);
            
            return (
              <Tooltip key={dayIndex}>
                <TooltipTrigger asChild>
                  <div 
                    className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110 hover:ring-2 ring-oxford-blue shadow-frosted backdrop-blur-frosted"
                    style={{ 
                      backgroundColor: color,
                      opacity: dayEntries.length > 0 ? intensity : 0.1
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <HabitGridTooltip 
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