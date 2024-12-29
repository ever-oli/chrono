import { eachDayOfInterval, subDays, startOfDay, endOfDay } from 'date-fns';

export const generateDateRange = () => {
  const endDate = new Date();
  const startDate = subDays(endDate, 364); // Last 365 days
  return eachDayOfInterval({ start: startDate, end: endDate });
};

export const getDayEntries = (date: Date, entries: any[]) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.started_at);
    return entryDate >= dayStart && entryDate <= dayEnd;
  });
};

export const calculateIntensity = (entries: any[]) => {
  return entries.reduce((sum, entry) => sum + (entry.seconds || 0), 0);
};