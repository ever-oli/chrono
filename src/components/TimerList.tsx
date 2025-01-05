import { useState } from "react";
import { useTimerContext } from "@/components/Timer/TimerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export default function TimerList() {
  const [showNewTimer, setShowNewTimer] = useState(false);
  const [newTimerName, setNewTimerName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#2D2D2D");
  const { timers, addTimer, deleteTimer, updateTimerSeconds, state } = useTimerContext();

  const handleAddTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTimerName.trim()) {
      await addTimer({
        name: newTimerName.trim(),
        color: selectedColor,
      });
      setNewTimerName("");
      setShowNewTimer(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Timers</h2>
      <ul>
        {timers.map((timer) => (
          <li key={timer.id} className="flex items-center justify-between">
            <span>{timer.name}</span>
            <Button variant="destructive" onClick={() => deleteTimer(timer.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
      {showNewTimer ? (
        <form onSubmit={handleAddTimer} className="flex items-center mt-4">
          <Input
            type="text"
            value={newTimerName}
            onChange={(e) => setNewTimerName(e.target.value)}
            placeholder="New Timer Name"
            className="mr-2"
          />
          <Button type="submit">
            <Plus />
          </Button>
        </form>
      ) : (
        <Button onClick={() => setShowNewTimer(true)}>Add Timer</Button>
      )}
    </div>
  );
}
