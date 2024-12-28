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
      className="rounded-lg p-4 relative overflow-hidden"
      style={{ 
        borderLeft: `4px solid ${color}`,
        backgroundColor: 'rgba(220, 158, 130, 0.15)',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 0 1rem 0 rgba(0, 0, 0, 0.2)'
      }}
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