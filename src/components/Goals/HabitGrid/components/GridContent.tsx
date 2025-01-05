import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimeEntry } from "@/types/timeEntry";
import { format } from "date-fns";
import { calculateIntensity } from "../utils/gridCalculations";
import GridTooltip from "./GridTooltip";

interface GridContentProps {
  dates: Date[];
  entries: TimeEntry[];
  color: string;
}

export default function GridContent({ dates, entries, color }: GridContentProps) {
  const weeks = dates.reduce((acc, date) => {
    const weekIndex = Math.floor(acc.length / 7);
    if (!acc[weekIndex]) {
      acc[weekIndex] = [];
    }
    acc[weekIndex].push(date);
    return acc;
  }, [] as Date[][]);

  const getDayEntries = (date: Date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.started_at);
      return (
        entryDate.getFullYear() === date.getFullYear() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getDate() === date.getDate()
      );
    });
  };

  const maxSeconds = Math.max(
    ...dates.map(date => 
      getDayEntries(date).reduce((sum, entry) => sum + (entry.seconds || 0), 0)
    )
  );

  return (
    <div className="grid grid-cols-[repeat(53,1fr)] gap-1">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-rows-7 gap-1">
          {week.map((date, dayIndex) => {
            const dayEntries = getDayEntries(date);
            const totalSeconds = dayEntries.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
            const intensity = calculateIntensity(totalSeconds, maxSeconds);
            
            return (
              <Tooltip key={dayIndex}>
                <TooltipTrigger asChild>
                  <div 
                    className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: color,
                      opacity: dayEntries.length > 0 ? intensity : 0.1
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