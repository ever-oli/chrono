import { ActivityCard } from "./ActivityCard";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

interface Activity {
  name: string;
  time: string;
  color: string;
  totalSeconds?: number;
}

const initialEvents: Activity[] = [
  { name: "Work", time: "2h 13m", color: "bg-purple-500" },
  { name: "Exercise", time: "1h 30m", color: "bg-green-500" },
  { name: "Hobbies", time: "45m", color: "bg-cyan-500" },
  { name: "Socializing", time: "1h", color: "bg-yellow-500" },
  { name: "Education", time: "30m", color: "bg-red-500" },
  { name: "Side project", time: "1h 15m", color: "bg-pink-500" },
  { name: "Reading", time: "45m", color: "bg-orange-500" },
];

export function EventsList({ onTimeUpdate }: { onTimeUpdate?: (activity: string, time: number) => void }) {
  const [events, setEvents] = useState<Activity[]>(initialEvents);

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