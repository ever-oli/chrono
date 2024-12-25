import { ActivityCard } from "./ActivityCard";

const events = [
  { name: "Morning Work", time: "2h 13m", color: "bg-purple-500" },
  { name: "Gym Session", time: "1h 30m", color: "bg-green-500" },
  { name: "Reading", time: "45m", color: "bg-cyan-500" },
  { name: "Team Meeting", time: "1h", color: "bg-yellow-500" },
];

export function EventsList() {
  return (
    <div className="space-y-2">
      {events.map((event, index) => (
        <ActivityCard
          key={index}
          name={event.name}
          time={event.time}
          color={event.color}
        />
      ))}
    </div>
  );
}