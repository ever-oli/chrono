import { FloatingTooltip } from "@/components/ui/floating-tooltip";
import { TimeEntry } from "@/types/timeEntry";
import { GridContentProps } from "@/types/habitGrid";
import GridTooltip from "./GridTooltip";
import { useRef, useEffect, useState } from "react";

export default function GridContent({ weeks, entriesByDate, maxIntensity, color }: GridContentProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollWidth = container.scrollWidth - container.clientWidth;
    const progress = (container.scrollLeft / scrollWidth) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
      >
        <div className="grid grid-cols-[repeat(53,1fr)] gap-[2px] md:gap-1 mx-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-[2px] md:gap-1">
              {week.map((date, dayIndex) => {
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
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-0.5 bg-black/10 rounded-full overflow-hidden w-full">
        <div 
          className="h-full bg-black/40 rounded-full transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}