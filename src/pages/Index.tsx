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
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Tracking</h1>
        <Button size="icon" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-4 w-4 text-primary" />
            <h2 className="text-base font-medium">Active Timer</h2>
          </div>
          <div className="rounded-lg bg-background/50 p-4">
            {activeActivity ? (
              <TimerComponent activity={activeActivity} onTimeUpdate={setActiveTime} />
            ) : (
              <div className="text-center text-muted-foreground py-6">
                Select an activity from below to start tracking
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-base font-medium">Recent Activities</h2>
            <EventsList onTimeUpdate={handleTimeUpdate} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-primary" />
              <h2 className="text-base font-medium">Time Distribution</h2>
            </div>
            <div className="rounded-lg bg-background/50 p-4">
              <TimelineChart activeActivity={activeActivity} activeTime={activeTime} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}