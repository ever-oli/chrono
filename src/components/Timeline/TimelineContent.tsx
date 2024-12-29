import Analytics from "@/components/Analytics";
import LifeChart from "@/components/Analytics/LifeChart";
import { TimeRange } from "./types";

interface TimelineContentProps {
  timeRange: TimeRange;
  currentDate: Date;
}

export default function TimelineContent({ timeRange, currentDate }: TimelineContentProps) {
  return (
    <div className="bg-card rounded-lg p-6">
      {timeRange === "life" ? (
        <Analytics timeRange="weeks" currentDate={currentDate}>
          {(data) => <LifeChart data={data} />}
        </Analytics>
      ) : (
        <Analytics 
          timeRange={timeRange}
          currentDate={currentDate}
        />
      )}
    </div>
  );
}