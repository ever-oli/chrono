import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export const getDateRange = (period: string) => {
  const now = new Date();
  const currentYear = now.getFullYear();

  if (period === 'current-year') {
    return {
      start: startOfYear(now),
      end: endOfYear(now),
      title: `Year ${currentYear} Statement`
    };
  }

  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
    title: `Monthly Statement - ${format(date, 'MMMM yyyy')}`
  };
};