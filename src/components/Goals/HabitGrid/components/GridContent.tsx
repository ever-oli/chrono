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
  
  // Create a 7x53 grid array
  const gridCells = Array.from({ length: 7 * 53 }, (_, index) => {
    const row = index % 7;
    const col = Math.floor(index / 7);
    return { row: row + 1, col: col + 1 };
  });

  // Flatten the weeks array to get all dates and filter out invalid dates
  const allDates = weeks.flat().filter(date => 
    date && date instanceof Date && !isNaN(date.getTime())
  );

  // Create a map of positions to dates
  const positionToDate = new Map(
    allDates.map(date => {
      const position = getGridPosition(date, startDate);
      return [`${position.row}-${position.column}`, date];
    })
  );

  return (
    <div className="grid grid-rows-7 grid-cols-53 gap-[1px]">
      {gridCells.map(({ row, col }, index) => {
        const date = positionToDate.get(`${row}-${col}`);
        const dayEntries = date ? entriesByDate[date.toISOString()] || [] : [];
        const intensity = maxIntensity > 0 && date
          ? calculateIntensity(dayEntries) / maxIntensity 
          : 0;
        
        // Calculate opacity based on intensity
        const opacity = date ? Math.min(0.2 + (intensity * 0.8), 1) : 0.05;
        
        return (
          <Tooltip key={`${row}-${col}`}>
            <TooltipTrigger asChild>
              <div 
                className="w-3 h-3 rounded-sm cursor-pointer transition-colors"
                style={{ 
                  backgroundColor: color,
                  opacity: dayEntries.length > 0 ? opacity : 0.1,
                  gridRow: row,
                  gridColumn: col,
                }}
              />
            </TooltipTrigger>
            {date && (
              <TooltipContent>
                <HabitGridTooltip date={date} entries={dayEntries} />
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </div>
  );
}