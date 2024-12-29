import { useEffect } from 'react';
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useGoalsSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = supabase
        .channel('goals-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'goals',
          },
          (payload) => {
            console.log('Goals change received!', payload);
            queryClient.invalidateQueries({ queryKey: ['goals'] });
          }
        )
        .subscribe((status) => {
          if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            console.log('Subscribed to goals changes!');
          }
          if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
            console.log('Subscription to goals closed');
          }
          if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
            console.error('Error in goals subscription');
          }
        });
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);
};