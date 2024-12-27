import { Button } from "@/components/ui/button";
import { Play, Pause, Trash2 } from "lucide-react";

interface TimerDisplayProps {
  id: string;
  name: string;
  color: string;
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TimerDisplay({
  name,
  color,
  seconds,
  isRunning,
  onToggle,
  onDelete,
}: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg relative overflow-hidden">
      <div 
        style={{ backgroundColor: color }} 
        className="absolute left-0 top-0 bottom-0 w-2" 
      />
      <div className="flex-1 pl-2">
        <h3 className="font-medium">{name}</h3>
        <div className="font-mono text-lg">
          {formatTime(seconds)}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="icon"
          variant={isRunning ? "destructive" : "default"}
          onClick={onToggle}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}