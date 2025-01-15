import { eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { TimeEntry } from '@/types/timeEntry';

export const generateDateRange = (start: Date, end: Date) => {
  return eachDayOfInterval({ start, end });
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