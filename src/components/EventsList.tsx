import { ActivityCard } from "./ActivityCard";
import { useState } from "react";
import { Timer } from "./Timer";

const events = [
  { name: "Work", time: "2h 13m", color: "bg-purple-500" },
  { name: "Exercise", time: "1h 30m", color: "bg-green-500" },
  { name: "Hobbies", time: "45m", color: "bg-cyan-500" },
  { name: "Socializing", time: "1h", color: "bg-yellow-500" },
  { name: "Education", time: "30m", color: "bg-red-500" },
  { name: "Side project", time: "1h 15m", color: "bg-pink-500" },
  { name: "Reading", time: "45m", color: "bg-orange-500" },
];

export function EventsList({ onTimeUpdate }: { onTimeUpdate?: (activity: string, time: number) => void }) {
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  const handleTimeUpdate = (time: number) => {
    if (activeEvent) {
      onTimeUpdate?.(activeEvent, time);
    }
  };

  return (
    <div className="space-y-1.5">
      {events.map((event, index) => (
        <ActivityCard
          key={index}
          name={event.name}
          time={event.time}
          color={event.color}
          isActive={activeEvent === event.name}
          onClick={() => setActiveEvent(event.name)}
        />
      ))}
      {activeEvent && (
        <div className="mt-4">
          <Timer activity={activeEvent} onTimeUpdate={handleTimeUpdate} />
        </div>
      )}
    </div>
  );
}