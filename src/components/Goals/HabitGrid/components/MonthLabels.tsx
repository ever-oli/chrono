interface MonthLabelsProps {
  weeks: Date[][];
}

export default function MonthLabels({ weeks }: MonthLabelsProps) {
  return (
    <div className="flex mb-4">
      <div className="w-16 md:w-20" /> {/* Spacer for day labels */}
      <div className="flex-1 grid grid-cols-[repeat(53,1fr)] gap-1 md:gap-1.5">
        {weeks.map((_, i) => (
          <div key={i} className="text-xs md:text-sm text-muted-foreground" />
        ))}
      </div>
    </div>
  );
}