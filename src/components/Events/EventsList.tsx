import { format, parseISO } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import EventCard from "./EventCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface EventsListProps {
  groupedEvents: {
    [key: string]: Array<TimeEntry>;
  };
}

export default function EventsList({ groupedEvents }: EventsListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-8">
      {Object.entries(groupedEvents).map(([date, events]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-lg font-semibold">
            {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
          </h2>
          <div className="space-y-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                entry={event}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}