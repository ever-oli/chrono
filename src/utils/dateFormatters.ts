import { parseISO, format } from "date-fns";

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