import { TimeEntry } from "@/types/timeEntry";
import { DayActivity } from "@/types/habitGrid";
import { format, parseISO } from "date-fns";

export const processTimeEntries = (entries: TimeEntry[]): Map<string, DayActivity> => {
  const activityMap = new Map<string, DayActivity>();
  
  // Group entries by day
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
    dayActivity.totalSeconds += entry.seconds;
  });

  // Calculate intensities
  const maxSeconds = Math.max(
    ...Array.from(activityMap.values()).map(day => day.totalSeconds)
  );
    
  activityMap.forEach(activity => {
    activity.intensity = maxSeconds > 0 
      ? 0.2 + (0.8 * (activity.totalSeconds / maxSeconds))
      : 0.1;
  });

  return activityMap;
};

export const calculateGridPosition = (date: Date, startDate: Date) => {
  const weekIndex = Math.floor(
    (date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  
  return {
    row: date.getDay() + 1,
    column: weekIndex + 1
  };
};