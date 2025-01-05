import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dispatch } from 'react';
import { TimerAction } from '@/types/timerState';

export function useRunningTimers(dispatch: Dispatch<TimerAction>) {
  useEffect(() => {
    async function checkRunningTimers() {
      const { data: runningEntries, error } = await supabase
        .from('time_entries')
        .select('*')
        .is('ended_at', null);

      if (error) {
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
  }, [dispatch]);
}