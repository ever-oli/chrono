import { ChevronLeft, ChevronRight } from "lucide-react";
import { FloatingTooltip } from "@/components/ui/floating-tooltip";
import { TimeEntry } from "@/types/timeEntry";
import { GridContentProps } from "@/types/habitGrid";
import GridTooltip from "./GridTooltip";

export default function GridContent({ 
  weeks, 
  entriesByDate, 
  maxIntensity, 
  color,
  onPrevious,
  onNext,
  canNavigateNext 
}: GridContentProps) {
  return (
    <div className="relative group min-w-fit">
      <button 
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity disabled:cursor-not-allowed disabled:opacity-20"
        onClick={onPrevious}
        aria-label="Previous quarter"
      >
        <ChevronLeft className="w-8 h-8 text-oxford-blue" />
      </button>
      
      <div className="grid grid-cols-[repeat(53,1fr)] gap-1 md:gap-1.5 mx-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1 md:gap-1.5">
            {week.map((date, dayIndex) => {
              if (!date || date.getTime() === 0) {
                return (
                  <div 
                    key={dayIndex}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-sm"
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
                    className="w-6 h-6 md:w-8 md:h-8 rounded-sm cursor-pointer transition-all hover:scale-110 hover:shadow-lg"
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
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity disabled:cursor-not-allowed disabled:opacity-20"
        onClick={onNext}
        disabled={!canNavigateNext}
        aria-label="Next quarter"
      >
        <ChevronRight className="w-8 h-8 text-oxford-blue" />
      </button>
    </div>
  );
}