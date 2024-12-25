import { Button } from "@/components/ui/button";
import { TimelineChart } from "@/components/TimelineChart";
import { EventsList } from "@/components/EventsList";
import { Plus, Timer } from "lucide-react";
import { Timer as TimerComponent } from "@/components/Timer";

export default function Index() {
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
            <TimerComponent />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Time Distribution</h2>
          <TimelineChart />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
        <EventsList />
      </div>
    </div>
  );
}