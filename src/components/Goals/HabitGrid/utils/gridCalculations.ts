import { TimeEntry } from "@/types/timeEntry";
import { DayActivity } from "@/types/habitGrid";
import { format, parseISO, differenceInCalendarWeeks, startOfWeek } from "date-fns";

export const processTimeEntries = (entries: TimeEntry[]): Map<string, DayActivity> => {
  const activityMap = new Map<string, DayActivity>();
  
  // Group entries by day with improved date handling
  entries.forEach(entry => {
    const day = format(parseISO(entry.started_at), 'yyyy-MM-dd');
    
    if (!activityMap.has(day)) {
      activityMap.set(day, {
        date: parseISO(entry.started_at),
        totalSeconds: 0,
        entries: [],
        intensity: 0
      });
    }
    
    const dayActivity = activityMap.get(day)!;
    dayActivity.entries.push(entry);
    dayActivity.totalSeconds += entry.seconds || 0;
  });

  // Calculate intensities with improved scaling
  const maxSeconds = Math.max(
    ...Array.from(activityMap.values()).map(day => day.totalSeconds)
  );
    
  activityMap.forEach(activity => {
    // Enhanced intensity calculation with logarithmic scaling
    // This provides better visual distinction between different activity levels
    const normalizedValue = maxSeconds > 0 
      ? activity.totalSeconds / maxSeconds 
      : 0;
    
    activity.intensity = maxSeconds > 0 
      ? 0.2 + (0.8 * Math.log1p(normalizedValue * 9) / Math.log1p(9))
      : 0.1;
  });

  return activityMap;
};

export const calculateGridPosition = (date: Date, startDate: Date) => {
  const weekIndex = differenceInCalendarWeeks(date, startOfWeek(startDate));
  
  return {
    row: date.getDay() + 1,
    column: weekIndex + 1
  };
};

export const calculateDayIntensity = (entries: TimeEntry[], maxIntensity: number): number => {
  if (!entries.length || maxIntensity <= 0) return 0;
  
  const totalSeconds = entries.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
  const normalizedValue = totalSeconds / maxIntensity;
  
  // Apply logarithmic scaling for better visual distribution
  return 0.2 + (0.8 * Math.log1p(normalizedValue * 9) / Math.log1p(9));
};