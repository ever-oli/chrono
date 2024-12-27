import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfDay, endOfDay, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface TimelineProps {
  entries: Array<{
    id: string;
    name: string;
    color: string;
    started_at: string;
    ended_at: string | null;
    seconds: number;
  }>;
  view: "hours" | "days" | "weeks" | "months";
}

export default function Timeline({ entries, view }: TimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the date range based on the current view
  const getDateRange = () => {
    switch (view) {
      case "hours":
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
          format: "EEEE d MMMM"
        };
      case "days":
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
          format: "'Week' w, MMM yyyy"
        };
      case "weeks":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
          format: "MMMM yyyy"
        };
      case "months":
        return {
          start: new Date(currentDate.getFullYear(), 0, 1),
          end: new Date(currentDate.getFullYear(), 11, 31),
          format: "yyyy"
        };
    }
  };

  const dateRange = getDateRange();

  // Filter entries based on the current date range
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.started_at);
    return entryDate >= dateRange.start && entryDate <= dateRange.end;
  });

  const getTimelinePosition = (date: string) => {
    const startTime = dateRange.start.getTime();
    const endTime = dateRange.end.getTime();
    const entryTime = new Date(date).getTime();
    
    return ((entryTime - startTime) / (endTime - startTime)) * 100;
  };

  const getTimelineWidth = (start: string, end: string | null) => {
    if (!end) return 0;
    const startPos = getTimelinePosition(start);
    const endPos = getTimelinePosition(end);
    return endPos - startPos;
  };

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(current => {
      switch (view) {
        case "hours":
          return direction === 'prev' ? subDays(current, 1) : addDays(current, 1);
        case "days":
          return direction === 'prev' ? subDays(current, 7) : addDays(current, 7);
        case "weeks":
          return direction === 'prev' ? subDays(current, 30) : addDays(current, 30);
        case "months":
          return direction === 'prev' ? subDays(current, 365) : addDays(current, 365);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center font-medium">
        {format(currentDate, dateRange.format)}
      </div>

      <div className="relative h-[400px] border rounded-lg p-4 bg-background">
        {/* Time markers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
          {view === "hours" && Array.from({ length: 25 }).map((_, i) => (
            <span key={i}>{i.toString().padStart(2, '0')}:00</span>
          ))}
        </div>

        {/* Timeline entries */}
        <div className="relative mt-6 space-y-2">
          {filteredEntries.map(entry => (
            <div
              key={entry.id}
              className="absolute h-8 rounded flex items-center px-2 text-xs text-white overflow-hidden whitespace-nowrap"
              style={{
                backgroundColor: entry.color,
                left: `${getTimelinePosition(entry.started_at)}%`,
                width: `${getTimelineWidth(entry.started_at, entry.ended_at)}%`,
                minWidth: '50px'
              }}
            >
              {entry.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}