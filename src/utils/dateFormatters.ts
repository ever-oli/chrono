import { parseISO, format, differenceInSeconds } from "date-fns";

export const formatTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid date';
  }
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatTimeRange = (timeRange: string, date: Date): string => {
  switch (timeRange) {
    case "hours":
      return format(date, 'MMM d, yyyy');
    case "days":
      return `Week of ${format(date, 'MMM d, yyyy')}`;
    case "weeks":
      return format(date, 'MMMM yyyy');
    case "months":
      return format(date, 'yyyy');
    default:
      return '';
  }
};