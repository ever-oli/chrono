import { Button } from "@/components/ui/button";
import { TimelineChart } from "@/components/TimelineChart";
import { EventsList } from "@/components/EventsList";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  const [activeActivity, setActiveActivity] = useState<string>();
  const [activeTime, setActiveTime] = useState<number>();
  const [newActivity, setNewActivity] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleTimeUpdate = (activity: string, time: number) => {
    setActiveActivity(activity);
    setActiveTime(time);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newActivity.trim()) {
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const event = {
        name: newActivity.trim(),
        time: "0m",
        color: `bg-${randomColor}-500`
      };
      setNewActivity("");
      setIsDialogOpen(false);
      toast({
        title: "Activity added",
        description: "'" + event.name + "' has been added to your tracking list."
      });
      return event;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Tracking</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <Input
                placeholder="Activity name"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
              />
              <Button type="submit">Add Activity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <EventsList onTimeUpdate={handleTimeUpdate} onAddActivity={handleAddActivity} />
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-background/50 p-4">
              <TimelineChart activeActivity={activeActivity} activeTime={activeTime} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}