import { supabase } from '@/integrations/supabase/client';
import { Timer } from '@/types/timer';
import { QueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/Auth/AuthContext';

export function useTimerCRUD(queryClient: QueryClient) {
  const { user } = useAuth();

  const addTimer = async (timer: Omit<Timer, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) {
      throw new Error('User must be authenticated to add timer');
    }

    try {
      const { error } = await supabase
        .from('timers')
        .insert({
          ...timer,
          user_id: user.id
        });

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