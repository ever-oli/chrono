import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Play, Pause, Trash2 } from "lucide-react";

interface Timer {
  id: string;
  name: string;
  color: string;
  seconds: number;
  isRunning: boolean;
}

export default function Index() {
  const [timers, setTimers] = useState<Timer[]>([]);
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
          isRunning: false
        }
      ]);
      setNewTimerName("");
      setShowNewTimer(false);
    }
  };

  const deleteTimer = (id: string) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  const toggleTimer = (id: string) => {
    setTimers(timers.map(timer => 
      timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
    ));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Update running timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer =>
          timer.isRunning ? { ...timer, seconds: timer.seconds + 1 } : timer
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
          <div 
            key={timer.id} 
            className="flex items-center gap-4 p-4 border rounded-lg relative overflow-hidden"
          >
            <div 
              style={{ backgroundColor: timer.color }} 
              className="absolute left-0 top-0 bottom-0 w-2" 
            />
            <div className="flex-1 pl-2">
              <h3 className="font-medium">{timer.name}</h3>
              <div className="font-mono text-lg">
                {formatTime(timer.seconds)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={timer.isRunning ? "destructive" : "default"}
                onClick={() => toggleTimer(timer.id)}
              >
                {timer.isRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => deleteTimer(timer.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {timers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No timers yet. Click the + button to add one.
          </div>
        )}
      </div>
    </div>
  );
}