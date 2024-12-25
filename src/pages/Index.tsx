import { Button } from "@/components/ui/button";
import { TimelineChart } from "@/components/TimelineChart";
import { EventsList } from "@/components/EventsList";
import { Plus, Timer, BarChart } from "lucide-react";
import { Timer as TimerComponent } from "@/components/Timer";
import { useState } from "react";

export default function Index() {
  const [activeActivity, setActiveActivity] = useState<string>();
  const [activeTime, setActiveTime] = useState<number>();

  const handleTimeUpdate = (activity: string, time: number) => {
    setActiveActivity(activity);
    setActiveTime(time);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time Tracker</h1>
        <Button size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Active Timer</h2>
          </div>
          <div className="rounded-lg border p-4">
            {activeActivity ? (
              <TimerComponent activity={activeActivity} onTimeUpdate={setActiveTime} />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select an activity from below to start tracking
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Time Distribution</h2>
          </div>
          <div className="rounded-lg border p-4">
            <TimelineChart activeActivity={activeActivity} activeTime={activeTime} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
        <EventsList onTimeUpdate={handleTimeUpdate} />
      </div>
    </div>
  );
}