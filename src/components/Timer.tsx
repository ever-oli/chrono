import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface TimerProps {
  activity?: string;
  onTimeUpdate?: (time: number) => void;
}

export function Timer({ activity, onTimeUpdate }: TimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalContributed, setTotalContributed] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: number;
    if (isRunning) {
      intervalId = window.setInterval(() => {
        setTime((time) => {
          const newTime = time + 1;
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, onTimeUpdate]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      toast({
        title: "Timer Started",
        description: activity ? `Tracking time for: ${activity}` : undefined,
      });
    } else {
      setTotalContributed(prev => prev + time);
      toast({
        title: "Timer Paused",
        description: activity ? `Total time contributed to ${activity}: ${formatTime(totalContributed + time)}` : undefined,
      });
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    onTimeUpdate?.(0);
    toast({
      title: "Timer Reset",
      description: activity ? `Timer reset for: ${activity}` : undefined,
    });
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
    <div className="space-y-4">
      {activity && (
        <div className="text-sm text-muted-foreground">
          Currently tracking: <span className="font-medium text-foreground">{activity}</span>
        </div>
      )}
      <div className="text-4xl font-mono font-bold">{formatTime(time)}</div>
      {totalContributed > 0 && (
        <div className="text-sm text-muted-foreground">
          Total time contributed: {formatTime(totalContributed)}
        </div>
      )}
      <div className="flex justify-center gap-2">
        <Button
          variant={isRunning ? "destructive" : "default"}
          size="icon"
          onClick={handleStartStop}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}