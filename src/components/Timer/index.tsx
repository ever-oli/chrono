import { useState, useEffect } from "react";
import TimerDisplay from "./TimerDisplay";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialSeconds = async () => {
      console.log('Loading initial seconds for timer:', id);
      const { data, error } = await supabase
        .from('time_entries')
        .select('seconds')
        .eq('timer_id', id);
      
      if (error) {
        console.error('Error loading initial seconds:', error);
        return;
      }

      if (data) {
        const totalSeconds = data.reduce((acc, entry) => acc + entry.seconds, 0);
        setSeconds(totalSeconds);
      }
    };

    // Check if timer is already running
    const checkRunningState = async () => {
      console.log('Checking running state for timer:', id);
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('timer_id', id)
        .is('ended_at', null)
        .maybeSingle();

      if (error) {
        console.error('Error checking timer state:', error);
        return;
      }

      if (data) {
        setIsRunning(true);
        setStartTime(new Date(data.started_at));
      }
    };

    loadInitialSeconds();
    checkRunningState();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const toggleTimer = async () => {
    console.log('Toggling timer:', id, 'Current state:', isRunning);
    if (!isRunning) {
      const now = new Date();
      setStartTime(now);
      setIsRunning(true);
    } else {
      if (startTime) {
        const elapsedSeconds = Math.floor(
          (new Date().getTime() - startTime.getTime()) / 1000
        );
        
        const endTime = new Date(startTime.getTime() + (elapsedSeconds * 1000));
        
        const timeEntry = {
          timer_id: id,
          seconds: elapsedSeconds,
          started_at: startTime.toISOString(),
          ended_at: endTime.toISOString(),
          name: editName || name,
          notes: editNotes
        };

        const { error } = await supabase
          .from('time_entries')
          .insert([timeEntry]);

        if (error) {
          console.error('Error saving time entry:', error);
          toast({
            title: "Error",
            description: "Failed to save timer entry",
            variant: "destructive",
          });
          return;
        }

        await onSecondsUpdate(id, elapsedSeconds);
        queryClient.invalidateQueries({ queryKey: ['timers'] });
        toast({
          title: "Timer stopped",
          description: `Logged ${Math.floor(elapsedSeconds / 60)} minutes for ${name}`,
        });
      }
      setIsRunning(false);
      setEditName("");
      setEditNotes("");
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