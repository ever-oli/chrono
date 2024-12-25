import { ActivityCard } from "./ActivityCard";
import { useState } from "react";
import { Timer } from "./Timer";

const events = [
  { name: "Morning Work", time: "2h 13m", color: "bg-purple-500" },
  { name: "Gym Session", time: "1h 30m", color: "bg-green-500" },
  { name: "Reading", time: "45m", color: "bg-cyan-500" },
  { name: "Team Meeting", time: "1h", color: "bg-yellow-500" },
];

export function EventsList() {
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  return (
    <div className="space-y-2">
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
          <Timer activity={activeEvent} />
        </div>
      )}
    </div>
  );
}