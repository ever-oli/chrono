import { format } from "date-fns";

export const formatTimeRange = (timeRange: "hours" | "days" | "weeks" | "months", date: Date): string => {
  switch (timeRange) {
    case "hours":
      return format(date, "MMMM d, yyyy");
    case "days":
      return `Week of ${format(date, "MMMM d, yyyy")}`;
    case "weeks":
      return format(date, "MMMM yyyy");
    case "months":
      return format(date, "yyyy");
  }
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  
  parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
};