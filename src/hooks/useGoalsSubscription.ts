import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useGoalsSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Invalidate and refetch goals query
          queryClient.invalidateQueries({ queryKey: ['goals'] });
          
          // Show toast notification based on the event type
          const eventMessages = {
            INSERT: 'New goal created',
            UPDATE: 'Goal updated',
            DELETE: 'Goal deleted'
          };
          
          toast({
            title: eventMessages[payload.eventType as keyof typeof eventMessages],
            description: 'Goals list has been updated',
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIPTION_ERROR') {
          toast({
            title: 'Subscription Error',
            description: 'Failed to connect to real-time updates',
            variant: 'destructive',
          });
        }
      });

    return () => {
      console.log('Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
}