import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface TimerProps {
  activity?: string;
  onTimeUpdate?: (time: number) => void;
  allowMultiple?: boolean;
}

export function Timer({ activity, onTimeUpdate, allowMultiple }: TimerProps) {
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
          onTimeUpdate?.(totalContributed + newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, onTimeUpdate, totalContributed]);

  useEffect(() => {
    // Reset timer when activity changes
    setTime(0);
    setIsRunning(false);
    setTotalContributed(0);
  }, [activity]);

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
    setTotalContributed(0);
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
    <div className="space-y-2">
      <div className="text-xl font-mono font-medium">{formatTime(time)}</div>
      {totalContributed > 0 && (
        <div className="text-xs text-muted-foreground">
          Total: {formatTime(totalContributed)}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          variant={isRunning ? "destructive" : "default"}
          size="sm"
          onClick={handleStartStop}
        >
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}