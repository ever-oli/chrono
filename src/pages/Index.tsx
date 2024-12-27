import { useState } from "react";
import { Timer } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
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

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newActivity.trim()) {
      setActivities([
        ...activities,
        { 
          id: crypto.randomUUID(), 
          name: newActivity.trim(),
          color: `bg-[${selectedColor}]`
        }
      ]);
      setNewActivity("");
      setShowInput(false);
    }
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="activity-name">Activity Name</Label>
            <Input
              id="activity-name"
              type="text"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="Enter activity name"
              className="flex-1"
              autoFocus
              onBlur={() => !newActivity && setShowInput(false)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="activity-color">Activity Color</Label>
            <Input
              id="activity-color"
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="h-10 w-20"
            />
          </div>
          <Button type="submit">Add Activity</Button>
        </form>
      )}

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                <h3 className="font-medium">{activity.name}</h3>
              </div>
              <Timer />
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