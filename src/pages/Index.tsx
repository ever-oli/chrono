import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import Timer from "@/components/Timer";
import Analytics from "@/components/Analytics";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TimerData {
  id: string;
  name: string;
  color: string;
  seconds: number;
}

export default function Index() {
  const [showNewTimer, setShowNewTimer] = useState(false);
  const [newTimerName, setNewTimerName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#2D2D2D");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch timers with real-time updates
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
    // Refresh data every 5 seconds to keep analytics up to date
    refetchInterval: 5000
  });

  // Add timer mutation
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

  // Delete timer mutation
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

  const addTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTimerName.trim()) {
      addTimerMutation.mutate({
        name: newTimerName.trim(),
        color: selectedColor,
      });
      setNewTimerName("");
      setShowNewTimer(false);
    }
  };

  const deleteTimer = (id: string) => {
    deleteTimerMutation.mutate(id);
  };

  const updateTimerSeconds = async (id: string, seconds: number) => {
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
      toast({
        title: "Error",
        description: "Failed to update timer: " + error.message,
        variant: "destructive",
      });
    } else {
      // Invalidate queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: ['timers'] });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('time_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries'
        },
        () => {
          // Refresh data when time entries change
          queryClient.invalidateQueries({ queryKey: ['timers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Timers</h1>
        <Button size="icon" variant="ghost" onClick={() => setShowNewTimer(true)}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {showNewTimer && (
        <form onSubmit={addTimer} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={newTimerName}
              onChange={(e) => setNewTimerName(e.target.value)}
              placeholder="Timer name"
              className="w-full"
              autoFocus
              onBlur={() => !newTimerName && setShowNewTimer(false)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="h-10 w-20 min-w-[5rem] p-1 cursor-pointer"
            />
            <Button type="submit">Add Timer</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {timers.map((timer) => (
          <Timer
            key={timer.id}
            id={timer.id}
            name={timer.name}
            color={timer.color}
            onDelete={deleteTimer}
            onSecondsUpdate={updateTimerSeconds}
          />
        ))}
        {timers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No timers yet. Click the + button to add one.
          </div>
        )}
      </div>

      {timers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          <Analytics timers={timers} />
        </div>
      )}
    </div>
  );
}
