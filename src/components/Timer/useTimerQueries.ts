import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Timer } from '@/types/timer';

export function useTimerQueries() {
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

  return {
    timers,
    queryClient
  };
}