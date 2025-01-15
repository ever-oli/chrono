import { eachDayOfInterval, subDays, startOfDay, endOfDay, differenceInCalendarWeeks, startOfWeek, getDay } from 'date-fns';
import { TimeEntry } from '@/types/timeEntry';

export const generateDateRange = () => {
  const endDate = new Date();
  const startDate = subDays(endDate, 364); // Last 365 days
  return eachDayOfInterval({ start: startDate, end: endDate });
};

export const getDayEntries = (date: Date, entries: TimeEntry[]) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.started_at);
    return entryDate >= dayStart && entryDate <= dayEnd;
  });
};

export const calculateIntensity = (entries: TimeEntry[]) => {
  return entries.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
};

export const getGridPosition = (date: Date, startDate: Date) => {
  const weekIndex = differenceInCalendarWeeks(date, startOfWeek(startDate));
  const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  return {
    row: dayOfWeek + 1, // Grid rows start at 1
    column: weekIndex + 1, // Grid columns start at 1
  };
};