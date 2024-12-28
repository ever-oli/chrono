import { createContext, useContext, ReactNode } from "react";
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
} from "date-fns";

type TimeRange = "hours" | "days" | "weeks" | "months";

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangeContextType {
  getDateRange: (timeRange: TimeRange, currentDate: Date) => DateRange;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const getDateRange = (timeRange: TimeRange, currentDate: Date): DateRange => {
    switch (timeRange) {
      case "hours":
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate)
        };
      case "days":
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        };
      case "weeks":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      case "months":
        return {
          start: startOfYear(currentDate),
          end: endOfYear(currentDate)
        };
    }
  };

  return (
    <DateRangeContext.Provider value={{ getDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}