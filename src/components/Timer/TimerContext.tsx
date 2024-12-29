import React, { createContext, useContext, useEffect } from 'react';
import { TimerContextType } from '@/types/timerState';
import { useTimerState } from './useTimerState';
import { useTimerQueries } from './useTimerQueries';
import { useTimerSubscription } from './useTimerSubscription';
import { useTimerActions } from './useTimerActions';
import { useRunningTimers } from './useRunningTimers';

const TimerContext = createContext<TimerContextType | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useTimerState();
  const { timers, queryClient } = useTimerQueries();
  const { startTimer, stopTimer, addTimer, deleteTimer, updateTimerSeconds } = useTimerActions(dispatch, queryClient);

  useTimerSubscription(queryClient);
  useRunningTimers(dispatch);

  useEffect(() => {
    if (timers) {
      dispatch({ type: 'SET_TIMERS', payload: timers });
    }
  }, [timers]);

  const value = {
    state,
    dispatch,
    timers: timers || [],
    startTimer,
    stopTimer,
    addTimer,
    deleteTimer,
    updateTimerSeconds
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}