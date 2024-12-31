import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimeEntry } from "@/types/timeEntry";
import { format } from "date-fns";
import HabitGridTooltip from "../HabitGridTooltip";
import { calculateGridPosition, calculateDayIntensity } from "../utils/gridCalculations";

interface GridContentProps {
  weeks: Date[][];
  entriesByDate: Record<string, TimeEntry[]>;
  maxIntensity: number;
  color: string;
}

export default function GridContent({ 
  weeks, 
  entriesByDate, 
  maxIntensity, 
  color 
}: GridContentProps) {
  const startDate = weeks[0][0];
  
  const gridCells = Array.from({ length: 7 * 53 }, (_, index) => {
    const row = index % 7;
    const col = Math.floor(index / 7);
    return { row: row + 1, col: col + 1 };
  });

  const allDates = weeks.flat().filter(date => 
    date && date instanceof Date && !isNaN(date.getTime())
  );

  const positionToDate = new Map(
    allDates.map(date => {
      const position = calculateGridPosition(date, startDate);
      return [`${position.row}-${position.column}`, date];
    })
  );

  return (
    <div className="grid grid-rows-7 grid-cols-53 gap-[1px]">
      {gridCells.map(({ row, col }, index) => {
        const date = positionToDate.get(`${row}-${col}`);
        const dayEntries = date ? entriesByDate[date.toISOString()] || [] : [];
        const intensity = date ? calculateDayIntensity(dayEntries, maxIntensity) : 0;
        
        // Increased base opacity to 0.4 and improved visibility
        const opacity = date ? Math.max(0.4, intensity) : 0.1;
        
        return (
          <Tooltip key={`${row}-${col}`}>
            <TooltipTrigger asChild>
              <div 
                className="w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 
                          hover:ring-2 ring-oxford-blue hover:scale-110 hover:opacity-80"
                style={{ 
                  backgroundColor: color,
                  opacity: dayEntries.length > 0 ? opacity : 0.1,
                  gridRow: row,
                  gridColumn: col,
                }}
              />
            </TooltipTrigger>
            {date && (
              <TooltipContent sideOffset={5}>
                <HabitGridTooltip date={date} entries={dayEntries} />
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </div>
  );
}