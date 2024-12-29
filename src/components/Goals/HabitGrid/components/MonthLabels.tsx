import { format, isSameMonth, differenceInDays } from 'date-fns';

interface MonthLabelsProps {
  weeks: Date[][];
}

export default function MonthLabels({ weeks }: MonthLabelsProps) {
  // Calculate which months to show based on spacing
  const monthsToShow = weeks.reduce((acc, week, i) => {
    const date = week[0];
    const prevDate = i > 0 ? weeks[i-1][0] : null;
    
    // Always show the first month
    if (i === 0) {
      acc.push(i);
      return acc;
    }
    
    // Show month if it's different from previous and has enough space
    if (prevDate && !isSameMonth(prevDate, date)) {
      // Check if there's enough space from the last shown month
      const lastShownWeekIndex = acc[acc.length - 1];
      const daysSinceLastLabel = differenceInDays(date, weeks[lastShownWeekIndex][0]);
      
      // Only show if there's at least 14 days (2 weeks) since last label
      if (daysSinceLastLabel >= 14) {
        acc.push(i);
      }
    }
    
    return acc;
  }, [] as number[]);

  return (
    <div className="flex mb-8 text-sm text-muted-foreground relative h-6">
      <div className="w-12" /> {/* Spacer for day labels */}
      <div className="flex-1 flex">
        {weeks.map((week, i) => {
          const date = week[0];
          const showMonth = monthsToShow.includes(i);
          
          return (
            <div key={i} className="w-3 mx-[1px] relative">
              {showMonth && (
                <div className="absolute -top-1 left-0 whitespace-nowrap transform -translate-x-1/2">
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