import { format, isSameMonth } from 'date-fns';

interface MonthLabelsProps {
  weeks: Date[][];
}

export default function MonthLabels({ weeks }: MonthLabelsProps) {
  return (
    <div className="flex mb-6 text-sm text-muted-foreground">
      <div className="w-12" /> {/* Increased spacer width for day labels */}
      <div className="flex-1 flex">
        {weeks.map((week, i) => {
          const date = week[0];
          const showMonth = i === 0 || !isSameMonth(weeks[i-1][0], date);
          return (
            <div key={i} className="w-3 mx-[1px]">
              {showMonth && (
                <div className="absolute -top-4 whitespace-nowrap">
                  {format(date, 'MMM')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}