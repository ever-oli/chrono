import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeEntry';
import { TimerAction } from '@/types/timerState';
import { Dispatch } from 'react';

export function useTimerUpdate(dispatch: Dispatch<TimerAction>) {
  const { toast } = useToast();

  const updateTimerSeconds = async (id: string, seconds: number, currentEntry: TimeEntry | undefined) => {
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

  return {
    updateTimerSeconds
  };
}