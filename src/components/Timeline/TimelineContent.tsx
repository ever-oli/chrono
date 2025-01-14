import Analytics from "@/components/Analytics";
import LifeChart from "@/components/Analytics/LifeChart";
import { TimeRange } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimelineContentProps {
  timeRange: TimeRange;
  currentDate: Date;
}

export default function TimelineContent({ timeRange, currentDate }: TimelineContentProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`bg-card rounded-lg ${isMobile ? 'p-2' : 'p-6'}`}>
      {timeRange === "life" ? (
        <div className="overflow-x-auto">
          <div className={`min-w-[800px] ${isMobile ? 'pb-4' : ''}`}>
            <Analytics timeRange="weeks" currentDate={currentDate}>
              {(data) => <LifeChart data={data} />}
            </Analytics>
          </div>
        </div>
      ) : (
        <Analytics 
          timeRange={timeRange}
          currentDate={currentDate}
        />
      )}
    </div>
  );
}