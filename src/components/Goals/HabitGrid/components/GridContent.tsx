import { useState } from "react";
import { TimeEntry } from "@/types/timeEntry";
import { GridContentProps } from "@/types/habitGrid";
import SharedTooltip from "./SharedTooltip";
import { calculateIntensity } from "../utils/gridCalculations";

export default function GridContent({ weeks, entriesByDate, maxIntensity, color }: GridContentProps) {
  const [tooltipData, setTooltipData] = useState<{
    mouseX: number;
    mouseY: number;
    date: Date | null;
    entries: TimeEntry[];
    isVisible: boolean;
  }>({
    mouseX: 0,
    mouseY: 0,
    date: null,
    entries: [],
    isVisible: false
  });

  const handleMouseEnter = (
    e: React.MouseEvent, 
    date: Date, 
    entries: TimeEntry[]
  ) => {
    if (entries.length > 0) {
      setTooltipData({
        mouseX: e.clientX,
        mouseY: e.clientY,
        date,
        entries,
        isVisible: true
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltipData(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <>
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
                <div 
                  key={dayIndex}
                  className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110 hover:ring-2 ring-oxford-blue shadow-frosted backdrop-blur-frosted"
                  style={{ 
                    backgroundColor: color,
                    opacity: dayEntries.length > 0 ? intensity : 0.1
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, date, dayEntries)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}
          </div>
        ))}
      </div>
      <SharedTooltip {...tooltipData} />
    </>
  );
}