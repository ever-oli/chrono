import { format } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import EventCard from "./EventCard";

interface EventsListProps {
  groupedEvents: {
    [key: string]: Array<TimeEntry>;
  };
}

export default function EventsList({ groupedEvents }: EventsListProps) {
  console.log('EventsList received groupedEvents:', groupedEvents);
  
  return (
    <div className="space-y-8">
      {Object.entries(groupedEvents).map(([date, events]) => {
        console.log(`Events for date ${date}:`, events);
        return (
          <div key={date} className="space-y-4">
            <h2 className="text-lg font-semibold">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="space-y-2">
              {events.map((event) => {
                console.log('Event data:', event);
                return (
                  <EventCard
                    key={event.id}
                    entry={event}
                    onDelete={() => {
                      // Handle delete
                      console.log('Delete event:', event.id);
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}