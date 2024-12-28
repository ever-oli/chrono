import { Button } from "@/components/ui/button";
import { Trash2, Play, Pause } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TimerControls({ 
  isRunning, 
  onToggle, 
  onDelete 
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="text-primary hover:text-primary/80"
      >
        {isRunning ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}