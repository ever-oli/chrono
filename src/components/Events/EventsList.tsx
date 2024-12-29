import { format } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import EventCard from "./EventCard";

interface EventsListProps {
  groupedEvents: {
    [key: string]: Array<TimeEntry & {
      timer?: {
        id: string;
        name: string;
        color: string;
      };
    }>;
  };
}

export default function EventsList({ groupedEvents }: EventsListProps) {
  return (
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
                onDelete={() => {
                  // Handle delete
                  console.log('Delete event:', event.id);
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}