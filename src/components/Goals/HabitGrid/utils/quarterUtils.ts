import { startOfQuarter, endOfQuarter, addQuarters, subQuarters, eachDayOfInterval } from 'date-fns';

export const getQuarterDates = (date: Date) => {
  const start = startOfQuarter(date);
  const end = endOfQuarter(date);
  return eachDayOfInterval({ start, end });
};

export const getNextQuarter = (date: Date) => {
  return addQuarters(date, 1);
};

export const getPreviousQuarter = (date: Date) => {
  return subQuarters(date, 1);
};