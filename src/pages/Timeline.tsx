import { useState } from "react";
import { subDays, addDays } from "date-fns";
import TimelineHeader from "@/components/Timeline/TimelineHeader";
import TimelineContent from "@/components/Timeline/TimelineContent";
import { TimeRange } from "@/components/Timeline/types";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Timeline() {
  const [timeRange, setTimeRange] = useState<TimeRange>("hours");
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();

  const handlePrevious = () => {
    if (timeRange === "life") return;
    
    switch (timeRange) {
      case "hours":
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case "days":
        setCurrentDate(prev => subDays(prev, 7));
        break;
      case "weeks":
        setCurrentDate(prev => subDays(prev, 30));
        break;
      case "months":
        setCurrentDate(prev => subDays(prev, 365));
        break;
    }
  };

  const handleNext = () => {
    if (timeRange === "life") return;
    
    switch (timeRange) {
      case "hours":
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case "days":
        setCurrentDate(prev => addDays(prev, 7));
        break;
      case "weeks":
        setCurrentDate(prev => addDays(prev, 30));
        break;
      case "months":
        setCurrentDate(prev => addDays(prev, 365));
        break;
    }
  };

  return (
    <div className={`container mx-auto ${isMobile ? 'p-2' : 'p-4'} space-y-4`}>
      <TimelineHeader
        timeRange={timeRange}
        currentDate={currentDate}
        onTimeRangeChange={setTimeRange}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      <TimelineContent
        timeRange={timeRange}
        currentDate={currentDate}
      />
    </div>
  );
}