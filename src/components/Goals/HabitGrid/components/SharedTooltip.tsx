import { useEffect, useState } from "react";
import { TimeEntry } from "@/types/timeEntry";
import { format } from "date-fns";

interface SharedTooltipProps {
  mouseX: number;
  mouseY: number;
  date: Date | null;
  entries: TimeEntry[];
  isVisible: boolean;
}

export default function SharedTooltip({ 
  mouseX, 
  mouseY, 
  date, 
  entries, 
  isVisible 
}: SharedTooltipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Calculate position to keep tooltip in viewport
    const tooltip = document.getElementById('shared-tooltip');
    if (tooltip) {
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = mouseX + 10; // Offset from cursor
      let y = mouseY + 10;

      // Adjust if tooltip would go off screen
      if (x + tooltipRect.width > viewportWidth) {
        x = mouseX - tooltipRect.width - 10;
      }
      if (y + tooltipRect.height > viewportHeight) {
        y = mouseY - tooltipRect.height - 10;
      }

      setPosition({ x, y });
    }
  }, [mouseX, mouseY]);

  if (!isVisible || !date) return null;

  // Group entries by timer and calculate total seconds for each
  const timerSummary = entries.reduce((acc, entry) => {
    const timerId = entry.timer?.id || 'unknown';
    if (!acc[timerId]) {
      acc[timerId] = {
        name: entry.timer?.name || 'Unknown Timer',
        color: entry.timer?.color || '#e5e5e5',
        seconds: 0
      };
    }
    acc[timerId].seconds += entry.seconds || 0;
    return acc;
  }, {} as Record<string, { name: string; color: string; seconds: number }>);

  const totalSeconds = entries.reduce((acc, entry) => acc + (entry.seconds || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return (
    <div
      id="shared-tooltip"
      className="absolute z-50 p-3 rounded-lg bg-popover text-popover-foreground shadow-md border animate-in fade-in-0 zoom-in-95"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="p-2 max-w-xs">
        <p className="font-semibold">{format(date, 'MMMM d, yyyy')}</p>
        <p className="text-sm text-muted-foreground">
          {entries.length} {entries.length === 1 ? 'activity' : 'activities'}
        </p>
        <p className="text-sm text-muted-foreground">
          Total: {hours}h {minutes}m
        </p>
        <div className="mt-2 space-y-1">
          {Object.values(timerSummary).map(({ name, color, seconds }) => {
            const timerHours = Math.floor(seconds / 3600);
            const timerMinutes = Math.floor((seconds % 3600) / 60);
            
            return (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span>{name}</span>
                </div>
                <span className="text-muted-foreground">
                  {timerHours}h {timerMinutes}m
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
