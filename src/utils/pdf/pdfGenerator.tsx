import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/types/timeEntry";
import { getDateRange } from "./dateUtils";

export const generateEventsPDF = async (events: TimeEntry[], period: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-pdf', {
      body: { period }
    });

    if (error) throw error;

    // Create a blob from the PDF data
    const blob = new Blob([data], { type: 'application/pdf' });
    
    // Create a link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `time-statement-${period}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};