import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { TimerState, TimerContextType } from '@/types/timerState';
import { Timer } from '@/types/timer';
import { timerReducer } from './timerReducer';

const TimerContext = createContext<TimerContextType | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, {
    timers: {},
    activeTimers: new Set<string>(),
    currentEntries: {},
    isLoading: true,
    error: null
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        .single();

      if (error) throw error;
      if (!entry) throw new Error('Failed to create time entry');

      dispatch({
        type: 'START_TIMER',
        payload: { timerId, entry }
      });
    } catch (error: any) {
      toast({
        title: "Error starting timer",
        description: error.message,
        variant: "destructive"
      });
      dispatch({ type: 'SET_ERROR', payload: error });
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
    } catch (error: any) {
      toast({
        title: "Error stopping timer",
        description: error.message,
        variant: "destructive"
      });
      dispatch({ type: 'SET_ERROR', payload: error });
    }
  };

  const addTimer = async (timer: Omit<Timer, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('timers')
        .insert(timer);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      toast({
        title: "Timer added",
        description: `Timer "${timer.name}" has been added`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding timer",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTimer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      toast({
        title: "Timer deleted",
        description: `Timer has been deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting timer",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateTimerSeconds = async (id: string, seconds: number) => {
    const currentEntry = state.currentEntries[id];
    if (!currentEntry) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ seconds })
        .eq('id', currentEntry.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_ENTRY',
        payload: { timerId: id, entry: { ...currentEntry, seconds } }
      });
    } catch (error: any) {
      toast({
        title: "Error updating timer",
        description: error.message,
        variant: "destructive"
      });
    }
  };

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