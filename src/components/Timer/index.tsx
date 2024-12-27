import { useState, useEffect } from "react";
import TimerDisplay from "./TimerDisplay";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TimerProps {
  id: string;
  name: string;
  color: string;
  onDelete: (id: string) => void;
  onSecondsUpdate: (id: string, seconds: number) => void;
}

export default function Timer({ id, name, color, onDelete, onSecondsUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadInitialSeconds = async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('seconds')
        .eq('timer_id', id);
      
      if (!error && data) {
        const totalSeconds = data.reduce((acc, entry) => acc + entry.seconds, 0);
        setSeconds(totalSeconds);
      }
    };

    loadInitialSeconds();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = async () => {
    if (!isRunning) {
      // Starting timer
      const now = new Date();
      setStartTime(now);
      setIsRunning(true);
    } else {
      // Stopping timer
      if (startTime) {
        const elapsedSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        
        // Calculate end time by adding elapsed seconds to start time
        const endTime = new Date(startTime.getTime() + (elapsedSeconds * 1000));
        
        const timeEntry = {
          timer_id: id,
          seconds: elapsedSeconds,
          started_at: startTime.toISOString(),
          ended_at: endTime.toISOString()
        };

        const { error } = await supabase
          .from('time_entries')
          .insert([timeEntry]);

        // Only update if there was no error
        if (!error) {
          await onSecondsUpdate(id, elapsedSeconds);
          queryClient.invalidateQueries({ queryKey: ['timers'] });
        }
      }
      setIsRunning(false);
    }
  };

  return (
    <TimerDisplay
      id={id}
      name={name}
      color={color}
      seconds={seconds}
      isRunning={isRunning}
      onToggle={toggleTimer}
      onDelete={() => onDelete(id)}
    />
  );
}