interface MonthLabelsProps {
  weeks: Date[][];
}

export default function MonthLabels({ weeks }: MonthLabelsProps) {
  return (
    <div className="flex text-sm text-muted-foreground">
      <div className="w-12" /> {/* Spacer for day labels */}
      <div className="flex-1 flex">
        {weeks.map((week, i) => (
          <div key={i} className="w-3 mx-[1px]" />
        ))}
      </div>
    </div>
  );
}