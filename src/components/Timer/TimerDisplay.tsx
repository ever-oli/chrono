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
  onEdit: () => void;
}

export default function TimerDisplay({
  name,
  color,
  seconds,
  isRunning,
  onToggle,
  onDelete,
  onEdit
}: TimerDisplayProps) {
  return (
    <div 
      className="flex items-center justify-between p-4 bg-secondary rounded-lg"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center gap-4">
        <div>
          <h3 className="font-medium text-primary">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDuration(seconds)}
          </p>
        </div>
      </div>
      <TimerControls
        isRunning={isRunning}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}