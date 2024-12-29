interface MonthLabelsProps {
  weeks: Date[][];
}

export default function MonthLabels({ weeks }: MonthLabelsProps) {
  return (
    <div className="flex mb-8 text-sm text-muted-foreground relative h-6">
      <div className="w-12" /> {/* Spacer for day labels */}
      <div className="flex-1 flex">
        {weeks.map((week, i) => (
          <div key={i} className="w-3 mx-[1px] relative" />
        ))}
      </div>
    </div>
  );
}