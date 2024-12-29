import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Timer } from '@/types/timer';
import { QueryClient } from '@tanstack/react-query';

export function useTimerCRUD(queryClient: QueryClient) {
  const { toast } = useToast();

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

  return {
    addTimer,
    deleteTimer
  };
}