const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DayLabels() {
  return (
    <div className="grid grid-rows-7 gap-1 md:gap-1.5 mr-4 text-right">
      {DAYS.map((day, index) => (
        <div key={index} className="h-6 md:h-8 flex items-center justify-end">
          <span className="text-xs md:text-sm text-muted-foreground">{day}</span>
        </div>
      ))}
    </div>
  );
}