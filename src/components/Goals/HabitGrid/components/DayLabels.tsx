const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DayLabels() {
  return (
    <div className="flex flex-col mr-4 text-sm font-mono text-space-cadet/80">
      {DAYS.map((day, i) => (
        <div key={day} className="h-3 flex items-center min-w-[3rem]" />
      ))}
    </div>
  );
}