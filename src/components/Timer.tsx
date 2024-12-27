import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";

interface TimerProps {
  activity?: string;
  onTimeUpdate?: (time: number) => void;
  allowMultiple?: boolean;
}

export function Timer({ activity, onTimeUpdate, allowMultiple }: TimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId: number;
    if (isRunning) {
      intervalId = window.setInterval(() => {
        setTime(time => {
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
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    onTimeUpdate?.(0);
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