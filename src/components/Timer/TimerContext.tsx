import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Timer {
  id: string;
  name: string;
  color: string;
  isRunning?: boolean;
}

interface TimerContextType {
  timers: Timer[];
  addTimer: (timer: Omit<Timer, "id">) => void;
  deleteTimer: (id: string) => void;
  updateTimerSeconds: (id: string, seconds: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadTimers = async () => {
      console.log('Loading timers...');
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading timers:', error);
        return;
      }

      if (data) {
        // Initialize timers with isRunning state from time_entries
        const timersWithRunningState = await Promise.all(
          data.map(async (timer) => {
            const { data: entry, error } = await supabase
              .from('time_entries')
              .select('*')
              .eq('timer_id', timer.id)
              .is('ended_at', null)
              .maybeSingle();

            if (error) {
              console.error('Error checking timer running state:', error);
            }

            return {
              ...timer,
              isRunning: !!entry,
            };
          })
        );
        console.log('Timers loaded:', timersWithRunningState);
        setTimers(timersWithRunningState);
      }
    };

    loadTimers();

    // Set up real-time subscription
    const timerChannel = supabase.channel('timers-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timers' },
        (payload) => {
          console.log('Timer change received:', payload);
          loadTimers(); // Reload timers when changes occur
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries' },
        (payload) => {
          console.log('Time entry change received:', payload);
          loadTimers(); // Reload timers to update running states
        }
      )
      .subscribe();

    setChannel(timerChannel);

    // Cleanup subscription
    return () => {
      console.log('Cleaning up timer subscriptions...');
      if (timerChannel) {
        supabase.removeChannel(timerChannel);
      }
    };
  }, []);

  const addTimer = async (timer: Omit<Timer, "id">) => {
    console.log('Adding timer:', timer);
    const { data, error } = await supabase
      .from('timers')
      .insert([timer])
      .select()
      .single();

    if (error) {
      console.error('Error adding timer:', error);
      toast({
        title: "Error",
        description: "Failed to add timer",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setTimers((prev) => [...prev, { ...data, isRunning: false }]);
      toast({
        title: "Timer Added",
        description: `${timer.name} has been added to your timers`,
      });
    }
  };

  const deleteTimer = async (id: string) => {
    console.log('Deleting timer:', id);
    const { error } = await supabase
      .from('timers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting timer:', error);
      toast({
        title: "Error",
        description: "Failed to delete timer",
        variant: "destructive",
      });
      return;
    }

    setTimers((prev) => prev.filter((timer) => timer.id !== id));
    toast({
      title: "Timer Deleted",
      description: "Timer has been removed",
    });
  };

  const updateTimerSeconds = async (id: string, seconds: number) => {
    console.log('Updating timer seconds:', id, seconds);
    const timer = timers.find((t) => t.id === id);
    if (timer) {
      setTimers((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, isRunning: seconds > 0 } : t
        )
      );
    }
  };

  return (
    <TimerContext.Provider
      value={{
        timers,
        addTimer,
        deleteTimer,
        updateTimerSeconds,
      }}
    >
      {children}
      <Toaster />
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimerContext must be used within a TimerProvider");
  }
  return context;
}