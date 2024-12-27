import { useState } from "react";
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

  return (
    <div className="space-y-4">
      <div className="text-center text-lg font-medium">
        {format(currentDate, dateRange.format)}
      </div>

      <div className="relative min-h-[400px] border rounded-lg p-4">
        {filteredEntries.map(entry => (
          <div
            key={entry.id}
            className="absolute h-12 rounded-md flex items-center px-3 text-sm text-white"
            style={{
              backgroundColor: entry.color,
              left: `${(new Date(entry.started_at).getHours() / 24) * 100}%`,
              width: entry.ended_at 
                ? `${((new Date(entry.ended_at).getTime() - new Date(entry.started_at).getTime()) / (24 * 60 * 60 * 1000)) * 100}%`
                : "100px",
              top: "50%",
              transform: "translateY(-50%)"
            }}
          >
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}