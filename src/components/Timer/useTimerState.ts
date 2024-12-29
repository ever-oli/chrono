import { useReducer } from 'react';
import { TimerState, TimerAction } from '@/types/timerState';
import { timerReducer } from './timerReducer';

export function useTimerState() {
  const [state, dispatch] = useReducer(timerReducer, {
    timers: {},
    activeTimers: new Set<string>(),
    currentEntries: {},
    isLoading: true,
    error: null
  });

  return { state, dispatch };
}