import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Analytics from "@/components/Analytics";
import { subDays, addDays } from "date-fns";
import { formatTimeRange } from "@/utils/dateFormatters";

type TimeRange = "hours" | "days" | "weeks" | "months";

export default function Timeline() {
  const [timeRange, setTimeRange] = useState<TimeRange>("hours");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevious = () => {
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
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center min-w-[200px]">
          <div className="text-lg font-medium mb-2">
            {formatTimeRange(timeRange, currentDate)}
          </div>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hours">Today</TabsTrigger>
              <TabsTrigger value="days">Week</TabsTrigger>
              <TabsTrigger value="weeks">Month</TabsTrigger>
              <TabsTrigger value="months">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6">
        <Analytics 
          timeRange={timeRange}
          currentDate={currentDate}
        />
      </div>
    </div>
  );
}