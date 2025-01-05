import { supabase } from '@/integrations/supabase/client';
import { Timer } from '@/types/timer';
import { QueryClient } from '@tanstack/react-query';

export function useTimerCRUD(queryClient: QueryClient) {
  const addTimer = async (timer: Omit<Timer, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('timers')
        .insert({ ...timer, user_id: user.id });

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['timers'] });
    } catch (error: any) {
      console.error('Error adding timer:', error.message);
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
    } catch (error: any) {
      console.error('Error deleting timer:', error.message);
    }
  };

  return {
    addTimer,
    deleteTimer
  };
}