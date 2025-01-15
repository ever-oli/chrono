import { addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface QuarterRange {
  start: Date;
  end: Date;
}

export const getQuarterRange = (date: Date): QuarterRange => {
  const start = startOfMonth(subMonths(date, 2));
  const end = endOfMonth(date);
  return { start, end };
};

export const getNextQuarter = (currentDate: Date): Date => {
  return addMonths(currentDate, 1);
};

export const getPreviousQuarter = (currentDate: Date): Date => {
  return subMonths(currentDate, 1);
};

export const canNavigateNext = (date: Date): boolean => {
  const now = new Date();
  return date < now;
};