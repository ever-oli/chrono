import { supabase } from '@/integrations/supabase/client';
import { QueryClient } from '@tanstack/react-query';
import { Timer } from '@/types/timer';

export function useTimerCRUD(queryClient: QueryClient) {
  const addTimer = async (timer: Omit<Timer, 'id' | 'created_at' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('timers')
        .insert({
          name: timer.name,
          color: timer.color,
          user_id: user.id
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['timers'] });
    } catch (error: any) {
      console.error('Error adding timer:', error.message);
      throw error;
    }
  };

  const deleteTimer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['timers'] });
    } catch (error: any) {
      console.error('Error deleting timer:', error.message);
      throw error;
    }
  };

  const updateTimer = async (id: string, timer: Partial<Timer>) => {
    try {
      const { error } = await supabase
        .from('timers')
        .update(timer)
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['timers'] });
    } catch (error: any) {
      console.error('Error updating timer:', error.message);
      throw error;
    }
  };

  return {
    addTimer,
    deleteTimer,
    updateTimer,
  };
}
