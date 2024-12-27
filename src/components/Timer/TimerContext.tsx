import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimerContextType {
  timers: Array<{
    id: string;
    name: string;
    color: string;
    seconds: number;
  }>;
  addTimer: (timer: { name: string; color: string }) => void;
  deleteTimer: (id: string) => void;
  updateTimerSeconds: (id: string, seconds: number) => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timers = [] } = useQuery({
    queryKey: ['timers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timers')
        .select(`
          id,
          name,
          color,
          time_entries (seconds)
        `);
      
      if (error) throw error;
      
      return data.map(timer => ({
        id: timer.id,
        name: timer.name,
        color: timer.color,
        seconds: timer.time_entries?.reduce((acc: number, entry: any) => acc + entry.seconds, 0) || 0
      }));
    },
    refetchInterval: 5000
  });

  const addTimerMutation = useMutation({
    mutationFn: async (newTimer: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from('timers')
        .insert([newTimer])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      toast({
        title: "Timer created",
        description: "Your new timer has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create timer: " + error.message,
        variant: "destructive",
      });
    }
  });

  const deleteTimerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('timers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      toast({
        title: "Timer deleted",
        description: "Timer has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete timer: " + error.message,
        variant: "destructive",
      });
    }
  });

  const updateTimerSeconds = async (id: string, seconds: number) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .insert([
          { 
            timer_id: id,
            seconds: seconds,
            ended_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error("Error updating timer seconds:", error);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['timers'] });
    } catch (error) {
      console.error("Error in updateTimerSeconds:", error);
    }
  };

  return (
    <TimerContext.Provider value={{
      timers,
      addTimer: (timer) => addTimerMutation.mutate(timer),
      deleteTimer: (id) => deleteTimerMutation.mutate(id),
      updateTimerSeconds,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}