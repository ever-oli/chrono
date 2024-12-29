import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient } from '@tanstack/react-query';

export function useTimerSubscription(queryClient: QueryClient) {
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
}