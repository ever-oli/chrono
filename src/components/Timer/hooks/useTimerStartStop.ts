import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeEntry';
import { TimerAction } from '@/types/timerState';
import { Dispatch } from 'react';

export function useTimerStartStop(dispatch: Dispatch<TimerAction>) {
  const { toast } = useToast();

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

  const stopTimer = async (timerId: string, currentEntry: TimeEntry | undefined) => {
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
        description: `Timer has been stopped`,
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

  return {
    startTimer,
    stopTimer
  };
}