import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventsList from "@/components/Events/EventsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NewEventForm from "@/components/Events/NewEventForm";

export default function Events() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          name,
          notes,
          marker_size,
          seconds,
          started_at,
          ended_at,
          timers (
            id,
            name,
            color
          )
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Group events by date
  const groupedEvents = events.reduce((groups: any, event) => {
    const date = format(parseISO(event.started_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  return (
    <div className="container max-w-2xl mx-auto p-4 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Events Log</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <NewEventForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading events...</div>
      ) : (
        <EventsList groupedEvents={groupedEvents} />
      )}
    </div>
  );
}