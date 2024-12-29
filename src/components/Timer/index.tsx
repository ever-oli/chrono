import { useEffect, useRef, useState } from "react";
import TimerDisplay from "./TimerDisplay";
import { useTimerContext } from "./TimerContext";
import { Timer as TimerType } from "@/types/timer";
import { formatDuration } from "@/utils/dateFormatters";

interface TimerProps {
  id: string;
  name: string;
  color: string;
  onDelete: (id: string) => void;
  onSecondsUpdate: (id: string, seconds: number) => void;
}

export default function Timer({ 
  id, 
  name, 
  color, 
  onDelete, 
  onSecondsUpdate 
}: TimerProps) {
  const { state, startTimer, stopTimer } = useTimerContext();
  const isRunning = state.activeTimers.has(id);
  const currentEntry = state.currentEntries[id];
  const intervalRef = useRef<number>();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isRunning && currentEntry) {
      const startTime = new Date(currentEntry.started_at).getTime();
      const initialSeconds = Math.floor((Date.now() - startTime) / 1000);
      setSeconds(initialSeconds);

      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          onSecondsUpdate(id, newSeconds);
          return newSeconds;
        });
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [isRunning, currentEntry, id, onSecondsUpdate]);

  const handleToggle = async () => {
    if (isRunning) {
      await stopTimer(id, currentEntry);
    } else {
      await startTimer(id);
    }
  };

  return (
    <TimerDisplay
      id={id}
      name={name}
      color={color}
      seconds={seconds}
      isRunning={isRunning}
      onToggle={handleToggle}
      onDelete={() => onDelete(id)}
    />
  );
}