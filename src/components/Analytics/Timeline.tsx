import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfDay, endOfDay, addDays, subDays } from "date-fns";

interface TimelineProps {
  entries: Array<{
    id: string;
    name: string;
    color: string;
    started_at: string;
    ended_at: string | null;
    seconds: number;
  }>;
}

export default function Timeline({ entries }: TimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.started_at);
    return entryDate >= startOfDay(currentDate) && entryDate <= endOfDay(currentDate);
  });

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(current => 
      direction === 'prev' ? subDays(current, 1) : addDays(current, 1)
    );
  };

  const getTimelinePosition = (date: string) => {
    const startTime = startOfDay(currentDate).getTime();
    const endTime = endOfDay(currentDate).getTime();
    const entryTime = new Date(date).getTime();
    
    return ((entryTime - startTime) / (endTime - startTime)) * 100;
  };

  const getTimelineWidth = (start: string, end: string | null) => {
    if (!end) return 0;
    const startPos = getTimelinePosition(start);
    const endPos = getTimelinePosition(end);
    return endPos - startPos;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Daily Timeline</h3>
      
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateDay('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="font-medium">
          {format(currentDate, 'MMMM d, yyyy')}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateDay('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative h-[200px] border rounded-lg p-4">
        {/* Time markers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
          {Array.from({ length: 25 }).map((_, i) => (
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