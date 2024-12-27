import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import Timer from "@/components/Timer";
import Analytics from "@/components/Analytics";

interface TimerData {
  id: string;
  name: string;
  color: string;
  seconds: number;
}

export default function Index() {
  const [timers, setTimers] = useState<TimerData[]>([]);
  const [showNewTimer, setShowNewTimer] = useState(false);
  const [newTimerName, setNewTimerName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#2D2D2D");

  const addTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTimerName.trim()) {
      setTimers([
        ...timers,
        {
          id: crypto.randomUUID(),
          name: newTimerName.trim(),
          color: selectedColor,
          seconds: 0,
        }
      ]);
      setNewTimerName("");
      setShowNewTimer(false);
    }
  };

  const deleteTimer = (id: string) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  const updateTimerSeconds = (id: string, seconds: number) => {
    setTimers(timers.map(timer => 
      timer.id === id ? { ...timer, seconds } : timer
    ));
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Timers</h1>
        <Button size="icon" variant="ghost" onClick={() => setShowNewTimer(true)}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {showNewTimer && (
        <form onSubmit={addTimer} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={newTimerName}
              onChange={(e) => setNewTimerName(e.target.value)}
              placeholder="Timer name"
              className="w-full"
              autoFocus
              onBlur={() => !newTimerName && setShowNewTimer(false)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="h-10 w-20 min-w-[5rem] p-1 cursor-pointer"
            />
            <Button type="submit">Add Timer</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {timers.map((timer) => (
          <Timer
            key={timer.id}
            id={timer.id}
            name={timer.name}
            color={timer.color}
            onDelete={deleteTimer}
            onSecondsUpdate={(seconds) => updateTimerSeconds(timer.id, seconds)}
          />
        ))}
        {timers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No timers yet. Click the + button to add one.
          </div>
        )}
      </div>

      {timers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          <Analytics timers={timers} />
        </div>
      )}
    </div>
  );
}