import { formatDuration } from "@/utils/dateFormatters";
import TimerControls from "./TimerControls";

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
  onDelete
}: TimerDisplayProps) {
  return (
    <div 
      className="rounded-lg p-4 relative overflow-hidden bg-secondary/15 backdrop-blur shadow-lg"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-primary">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDuration(seconds)}
          </p>
        </div>
        <TimerControls
          isRunning={isRunning}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}