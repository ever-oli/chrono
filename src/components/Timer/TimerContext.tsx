import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";

interface Timer {
  id: string;
  name: string;
  color: string;
  isRunning?: boolean;  // Added isRunning property
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
  const { toast } = useToast();

  // Load timers from Supabase on mount
  useEffect(() => {
    const loadTimers = async () => {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading timers:', error);
        return;
      }

      if (data) {
        setTimers(data);
      }
    };

    loadTimers();
  }, []);

  const addTimer = async (timer: Omit<Timer, "id">) => {
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
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, seconds } : timer
      )
    );
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