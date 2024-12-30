import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimeEntry } from "@/types/timeEntry";
import HabitGridTooltip from "../HabitGridTooltip";
import { calculateIntensity, getGridPosition } from "../utils/dateUtils";

interface GridContentProps {
  weeks: Date[][];
  entriesByDate: Record<string, TimeEntry[]>;
  maxIntensity: number;
  color: string;
}

export default function GridContent({ weeks, entriesByDate, maxIntensity, color }: GridContentProps) {
  // Get the earliest date from the weeks array
  const startDate = weeks[0][0];
  
  // Flatten the weeks array to get all dates and filter out invalid dates
  const allDates = weeks.flat().filter(date => 
    date && date instanceof Date && !isNaN(date.getTime())
  );

  return (
    <div className="grid grid-rows-7 grid-cols-53 gap-[1px]">
      {allDates.map((date) => {
        const dayEntries = entriesByDate[date.toISOString()] || [];
        const intensity = maxIntensity > 0 
          ? calculateIntensity(dayEntries) / maxIntensity 
          : 0;
        
        // Calculate the grid position for this date
        const position = getGridPosition(date, startDate);
        
        // Calculate opacity based on intensity
        const opacity = Math.min(0.2 + (intensity * 0.8), 1);
        
        return (
          <Tooltip key={date.toISOString()}>
            <TooltipTrigger asChild>
              <div 
                className="w-3 h-3 rounded-sm cursor-pointer transition-colors"
                style={{ 
                  backgroundColor: color,
                  opacity: dayEntries.length > 0 ? opacity : 0.1,
                  gridRow: position.row,
                  gridColumn: position.column,
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <HabitGridTooltip date={date} entries={dayEntries} />
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}