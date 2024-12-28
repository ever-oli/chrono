import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Timer {
  id: string;
  name: string;
  color: string;
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

  const addTimer = (timer: Omit<Timer, "id">) => {
    const newTimer = {
      ...timer,
      id: crypto.randomUUID(),
    };
    setTimers((prev) => [...prev, newTimer]);
    toast({
      title: "Timer Added",
      description: `${timer.name} has been added to your timers`,
    });
  };

  const deleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
    toast({
      title: "Timer Deleted",
      description: "Timer has been removed",
    });
  };

  const updateTimerSeconds = (id: string, seconds: number) => {
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