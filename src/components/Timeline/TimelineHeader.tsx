import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatTimeRange } from "@/utils/dateFormatters";
import { TimeRange } from "./types";

interface TimelineHeaderProps {
  timeRange: TimeRange;
  currentDate: Date;
  onTimeRangeChange: (value: TimeRange) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function TimelineHeader({
  timeRange,
  currentDate,
  onTimeRangeChange,
  onPrevious,
  onNext,
}: TimelineHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
      </div>

      <div className="flex items-center justify-center gap-4">
        {timeRange !== "life" && (
          <Button variant="outline" size="icon" onClick={onPrevious}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="text-center min-w-[200px]">
          {timeRange !== "life" && (
            <div className="text-lg font-medium mb-2">
              {formatTimeRange(timeRange, currentDate)}
            </div>
          )}
          <Tabs 
            value={timeRange} 
            onValueChange={(value) => onTimeRangeChange(value as TimeRange)} 
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="hours">Today</TabsTrigger>
              <TabsTrigger value="days">Week</TabsTrigger>
              <TabsTrigger value="weeks">Month</TabsTrigger>
              <TabsTrigger value="months">Year</TabsTrigger>
              <TabsTrigger value="life">Life</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {timeRange !== "life" && (
          <Button variant="outline" size="icon" onClick={onNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </>
  );
}