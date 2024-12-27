import { ActivityCard } from "./ActivityCard";
import { useState } from "react";

interface Activity {
  name: string;
  time: string;
  color: string;
  totalSeconds?: number;
}

interface EventsListProps {
  onTimeUpdate?: (activity: string, time: number) => void;
  onAddActivity?: (e: React.FormEvent) => any;
}

export function EventsList({ onTimeUpdate, onAddActivity }: EventsListProps) {
  const [events, setEvents] = useState<Activity[]>([]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleTimeUpdate = (activity: string) => (time: number) => {
    setEvents(currentEvents => 
      currentEvents.map(event => {
        if (event.name === activity) {
          return {
            ...event,
            totalSeconds: time,
            time: formatTime(time)
          };
        }
        return event;
      })
    );
    onTimeUpdate?.(activity, time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = onAddActivity?.(e);
    if (newEvent) {
      setEvents(currentEvents => [...currentEvents, newEvent]);
    }
  };

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleSubmit} />
      {events.map((event, index) => (
        <ActivityCard
          key={index}
          name={event.name}
          time={event.time}
          color={event.color}
          onTimeUpdate={handleTimeUpdate(event.name)}
        />
      ))}
      {events.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No activities yet. Click the + button to add one.
        </div>
      )}
    </div>
  );
}