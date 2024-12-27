import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Play, Pause, RefreshCw, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Activity {
  id: string;
  name: string;
  color: string;
}

export default function Index() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#2D2D2D");
  const [timers, setTimers] = useState<{ [key: string]: number }>({});
  const [runningTimers, setRunningTimers] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const intervals: { [key: string]: number } = {};

    Object.entries(runningTimers).forEach(([id, isRunning]) => {
      if (isRunning) {
        intervals[id] = window.setInterval(() => {
          setTimers(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
          }));
        }, 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [runningTimers]);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newActivity.trim()) {
      const id = crypto.randomUUID();
      setActivities([
        ...activities,
        {
          id,
          name: newActivity.trim(),
          color: selectedColor
        }
      ]);
      setTimers(prev => ({ ...prev, [id]: 0 }));
      setRunningTimers(prev => ({ ...prev, [id]: false }));
      setNewActivity("");
      setShowInput(false);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(e.target.value);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[id];
      return newTimers;
    });
    setRunningTimers(prev => {
      const newRunningTimers = { ...prev };
      delete newRunningTimers[id];
      return newRunningTimers;
    });
  };

  const toggleTimer = (id: string) => {
    setRunningTimers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => ({
      ...prev,
      [id]: 0
    }));
    setRunningTimers(prev => ({
      ...prev,
      [id]: false
    }));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Activity Timers</h1>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowInput(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {showInput && (
        <form onSubmit={handleAddActivity} className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="activity-name">Activity Name</Label>
              <Input
                id="activity-name"
                type="text"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Enter activity name"
                className="mt-2"
                autoFocus
                onBlur={() => !newActivity && setShowInput(false)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="activity-color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="activity-color"
                  type="color"
                  value={selectedColor}
                  onChange={handleColorChange}
                  className="h-12 w-24 min-w-[6rem] cursor-pointer p-1 touch-manipulation"
                />
                <div 
                  style={{ backgroundColor: selectedColor }} 
                  className="h-12 w-6 rounded-full" 
                />
              </div>
            </div>
          </div>
          <Button type="submit">Add Activity</Button>
        </form>
      )}

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg relative overflow-hidden">
            <div 
              style={{ backgroundColor: activity.color }} 
              className="absolute left-0 top-0 bottom-0 w-4" 
            />
            <div className="flex-1 pl-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">{activity.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="text-xl font-mono font-medium">
                  {formatTime(timers[activity.id] || 0)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={runningTimers[activity.id] ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleTimer(activity.id)}
                  >
                    {runningTimers[activity.id] ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetTimer(activity.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteActivity(activity.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No activities yet. Click the + button to add one.
          </div>
        )}
      </div>
    </div>
  );
}