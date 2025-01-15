interface MonthLabelsProps {
  weeks: Date[][];
}

export default function MonthLabels({ weeks }: MonthLabelsProps) {
  return (
    <div className="flex text-xs md:text-sm text-muted-foreground">
      <div className="w-8 md:w-12" /> {/* Spacer for day labels */}
      <div className="flex-1 flex">
        {weeks.map((week, i) => (
          <div key={i} className="w-2 md:w-3 mx-[1px]" />
        ))}
      </div>
    </div>
  );
}