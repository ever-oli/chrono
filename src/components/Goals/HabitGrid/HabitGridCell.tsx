import { FloatingTooltip } from "@/components/ui/floating-tooltip";
import { TimeEntry } from "@/types/timeEntry";
import HabitGridTooltip from "./HabitGridTooltip";

interface HabitGridCellProps {
  date: Date;
  entries: TimeEntry[];
  intensity: number;
}

export default function HabitGridCell({ date, entries, intensity }: HabitGridCellProps) {
  const primaryColor = entries.length > 0 
    ? entries.reduce((prev, current) => 
        (current.seconds || 0) > (prev.seconds || 0) ? current : prev
      ).timer?.color 
    : '#E5E5E5';
  
  const opacity = Math.min(0.2 + (intensity * 0.8), 1);
  
  return (
    <FloatingTooltip
      content={<HabitGridTooltip date={date} entries={entries} />}
    >
      <div 
        className="w-2 h-2 md:w-3 md:h-3 rounded-sm cursor-pointer transition-all hover:scale-110 hover:ring-2 ring-oxford-blue shadow-frosted backdrop-blur-frosted"
        style={{ 
          backgroundColor: primaryColor,
          opacity: entries.length > 0 ? opacity : 0.1
        }}
      />
    </FloatingTooltip>
  );
}