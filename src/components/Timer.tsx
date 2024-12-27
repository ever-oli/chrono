import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
    // Load initial seconds from time_entries
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
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          return newSeconds;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = async () => {
    if (!isRunning) {
      // Starting timer
      setStartTime(new Date());
    } else {
      // Stopping timer
      if (startTime) {
        const elapsedSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        await onSecondsUpdate(id, elapsedSeconds);
        // Invalidate queries to refresh analytics
        queryClient.invalidateQueries({ queryKey: ['timers'] });
      }
    }
    setIsRunning(!isRunning);
  };

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
          onClick={toggleTimer}
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
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}