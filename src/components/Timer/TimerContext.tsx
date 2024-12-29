import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { TimerState, TimerAction } from '@/types/timerState';
import { Timer } from '@/types/timer';
import { TimeEntry } from '@/types/timeEntry';

const TimerContext = createContext<{
  state: TimerState;
  dispatch: React.Dispatch<TimerAction>;
  startTimer: (timerId: string) => Promise<void>;
  stopTimer: (timerId: string) => Promise<void>;
} | null>(null);

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_TIMERS':
      return {
        ...state,
        timers: action.payload.reduce((acc, timer) => ({
          ...acc,
          [timer.id]: timer
        }), {}),
        isLoading: false
      };
    case 'START_TIMER':
      return {
        ...state,
        activeTimers: new Set([...state.activeTimers, action.payload.timerId]),
        currentEntries: {
          ...state.currentEntries,
          [action.payload.timerId]: action.payload.entry
        }
      };
    case 'STOP_TIMER':
      const newActiveTimers = new Set(state.activeTimers);
      newActiveTimers.delete(action.payload.timerId);
      const { [action.payload.timerId]: _, ...remainingEntries } = state.currentEntries;
      return {
        ...state,
        activeTimers: newActiveTimers,
        currentEntries: remainingEntries
      };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        currentEntries: {
          ...state.currentEntries,
          [action.payload.timerId]: action.payload.entry
        }
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, {
    timers: {},
    activeTimers: new Set(),
    currentEntries: {},
    isLoading: true,
    error: null
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: timers } = useQuery({
    queryKey: ['timers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data as Timer[];
    }
  });

  useEffect(() => {
    const timerChannel = supabase
      .channel('timer-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timers'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['timers'] });
      })
      .subscribe();

    const entryChannel = supabase
      .channel('entry-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'time_entries'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      })
      .subscribe();

    return () => {
      timerChannel.unsubscribe();
      entryChannel.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    async function checkRunningTimers() {
      const { data: runningEntries, error } = await supabase
        .from('time_entries')
        .select('*')
        .is('ended_at', null);

      if (error) {
        toast({
          title: "Error checking running timers",
          description: error.message,
          variant: "destructive"
        });
        dispatch({ type: 'SET_ERROR', payload: error });
        return;
      }

      if (runningEntries) {
        for (const entry of runningEntries) {
          dispatch({
            type: 'START_TIMER',
            payload: { timerId: entry.timer_id, entry }
          });
        }
      }
    }

    checkRunningTimers();
  }, [toast]);

  useEffect(() => {
    if (timers) {
      dispatch({ type: 'SET_TIMERS', payload: timers });
    }
  }, [timers]);

  const startTimer = async (timerId: string) => {
    try {
      const { data: entry, error } = await supabase
        .from('time_entries')
        .insert({
          timer_id: timerId,
          started_at: new Date().toISOString(),
          seconds: 0
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!entry) throw new Error('Failed to create time entry');

      dispatch({
        type: 'START_TIMER',
        payload: { timerId, entry }
      });
    } catch (error) {
      toast({
        title: "Error starting timer",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  const stopTimer = async (timerId: string) => {
    const currentEntry = state.currentEntries[timerId];
    if (!currentEntry) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          ended_at: new Date().toISOString()
        })
        .eq('id', currentEntry.id);

      if (error) throw error;

      dispatch({ type: 'STOP_TIMER', payload: { timerId } });
      toast({
        title: "Timer stopped",
        description: `Timer "${state.timers[timerId]?.name}" has been stopped`,
      });
    } catch (error) {
      toast({
        title: "Error stopping timer",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  return (
    <TimerContext.Provider value={{ state, dispatch, startTimer, stopTimer }}>
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