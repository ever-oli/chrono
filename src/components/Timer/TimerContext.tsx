import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface TimerContextType {
  isRunning: boolean;
  seconds: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = () => {
    setIsRunning(true);
    toast({
      title: "Timer Started",
      description: "Your timer is now running",
    });
  };

  const stopTimer = () => {
    setIsRunning(false);
    toast({
      title: "Timer Stopped",
      description: `Total time: ${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds`,
    });
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    toast({
      title: "Timer Reset",
      description: "Your timer has been reset to 0",
    });
  };

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        seconds,
        startTimer,
        stopTimer,
        resetTimer,
      }}
    >
      <Toaster />
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}