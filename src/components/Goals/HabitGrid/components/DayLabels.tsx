const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DayLabels() {
  return (
    <div className="flex flex-col mr-2 text-sm text-muted-foreground">
      {DAYS.map((day, i) => (
        <div key={day} className="h-3 flex items-center">
          {i % 2 === 0 && day}
        </div>
      ))}
    </div>
  );
}