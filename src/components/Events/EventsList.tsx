import { format } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import EventCard from "./EventCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import NewEventForm from "./NewEventForm";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface EventsListProps {
  groupedEvents: {
    [key: string]: Array<TimeEntry>;
  };
}

export default function EventsList({ groupedEvents }: EventsListProps) {
  const [editingEvent, setEditingEvent] = useState<TimeEntry | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
    }
  };

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([date, events]) => (
          <div key={date} className="space-y-4">
            <h2 className="text-lg font-semibold">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="space-y-2">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  entry={event}
                  onDelete={handleDelete}
                  onEdit={setEditingEvent}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <NewEventForm
              mode="edit"
              initialData={editingEvent}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}