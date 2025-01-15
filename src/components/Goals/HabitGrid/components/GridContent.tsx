import { ChevronLeft, ChevronRight } from "lucide-react";
import { FloatingTooltip } from "@/components/ui/floating-tooltip";
import { TimeEntry } from "@/types/timeEntry";
import { GridContentProps } from "@/types/habitGrid";
import GridTooltip from "./GridTooltip";

export default function GridContent({ weeks, entriesByDate, maxIntensity, color }: GridContentProps) {
  return (
    <div className="relative group min-w-fit">
      <button 
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
        onClick={() => {/* TODO: Add quarter navigation */}}
      >
        <ChevronLeft className="w-6 h-6 text-oxford-blue" />
      </button>
      
      <div className="grid grid-cols-[repeat(53,1fr)] gap-[2px] md:gap-1 mx-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-[2px] md:gap-1">
            {week.map((date, dayIndex) => {
              // Skip rendering for invalid dates (new Date(0) or undefined)
              if (!date || date.getTime() === 0) {
                return (
                  <div 
                    key={dayIndex}
                    className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                    style={{ 
                      backgroundColor: color,
                      opacity: 0.1
                    }}
                  />
                );
              }

              const dayEntries = entriesByDate[date.toISOString()] || [];
              const totalSeconds = dayEntries.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
              const intensity = totalSeconds / maxIntensity;
              
              return (
                <FloatingTooltip
                  key={dayIndex}
                  content={<GridTooltip date={date} entries={dayEntries} />}
                >
                  <div 
                    className="w-2 h-2 md:w-3 md:h-3 rounded-sm cursor-pointer transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: color,
                      opacity: dayEntries.length > 0 ? 0.4 + (0.6 * intensity) : 0.1
                    }}
                  />
                </FloatingTooltip>
              );
            })}
          </div>
        ))}
      </div>

      <button 
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
        onClick={() => {/* TODO: Add quarter navigation */}}
      >
        <ChevronRight className="w-6 h-6 text-oxford-blue" />
      </button>
    </div>
  );
}