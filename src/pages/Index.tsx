import { useState } from "react";
import { Timer } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Activity {
  id: string;
  name: string;
  category: string;
  color: string;
}

const CATEGORIES = [
  { name: 'Work', color: 'bg-blue-500' },
  { name: 'Exercise', color: 'bg-green-500' },
  { name: 'Study', color: 'bg-purple-500' },
  { name: 'Personal', color: 'bg-orange-500' },
  { name: 'Other', color: 'bg-gray-500' }
];

export default function Index() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].name);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newActivity.trim()) {
      const category = CATEGORIES.find(cat => cat.name === selectedCategory) || CATEGORIES[0];
      setActivities([
        ...activities,
        { 
          id: crypto.randomUUID(), 
          name: newActivity.trim(),
          category: category.name,
          color: category.color
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
          <Input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="Enter activity name"
            className="flex-1"
            autoFocus
            onBlur={() => !newActivity && setShowInput(false)}
          />
          <RadioGroup
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="grid grid-cols-2 gap-4 sm:grid-cols-5"
          >
            {CATEGORIES.map((category) => (
              <div key={category.name} className="flex items-center space-x-2">
                <RadioGroupItem value={category.name} id={category.name} />
                <Label htmlFor={category.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  {category.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
                <span className="text-sm text-muted-foreground">({activity.category})</span>
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