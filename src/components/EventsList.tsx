import { ActivityCard } from "./ActivityCard";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

interface Activity {
  name: string;
  time: string;
  color: string;
  totalSeconds?: number;
}

export function EventsList({ onTimeUpdate }: { onTimeUpdate?: (activity: string, time: number) => void }) {
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

  return (
    <div className="space-y-1.5">
      {events.map((event, index) => (
        <ActivityCard
          key={index}
          name={event.name}
          time={event.time}
          color={event.color}
          onTimeUpdate={handleTimeUpdate(event.name)}
        />
      ))}
    </div>
  );
}