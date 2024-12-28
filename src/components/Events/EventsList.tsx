import { format, isToday, parseISO } from "date-fns";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import NewEventForm from "./NewEventForm";

interface Event {
  id: string;
  name?: string;
  notes?: string;
  timer_id: string;
  marker_size: 'small' | 'medium' | 'large';
  seconds: number;
  started_at: string;
  ended_at: string;
  timers: {
    id: string;
    name: string;
    color: string;
  };
}

interface EventsListProps {
  groupedEvents: {
    [key: string]: Event[];
  };
}

export default function EventsList({ groupedEvents }: EventsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'h:mm a');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getDateHeader = (date: string) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) {
      return 'Today';
    }
    return format(parsedDate, 'EEEE, MMMM d');
  };

  const getMarkerSize = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'h-2';
      case 'large': return 'h-6';
      default: return 'h-4';
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedEvents).map(([date, events]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {getDateHeader(date)}
            </h2>
            <span className="text-sm text-gray-500">
              {events.length} events
            </span>
          </div>

          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg p-4 relative overflow-hidden"
                style={{ 
                  borderLeft: `4px solid ${event.timers.color}`,
                  backgroundColor: 'rgba(220, 158, 130, 0.15)',
                  backdropFilter: 'blur(5px)',
                  boxShadow: '0 0 1rem 0 rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">
                        {event.name || event.timers.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatTime(event.started_at)} → {formatTime(event.ended_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">
                        {formatDuration(event.seconds)}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                          </DialogHeader>
                          <NewEventForm 
                            initialData={event}
                            mode="edit"
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  {event.notes && (
                    <p className="text-sm text-gray-600 mt-2">{event.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
