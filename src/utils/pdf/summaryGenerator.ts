import { jsPDF } from "jspdf";
import { TimeEntry } from "@/types/timeEntry";
import { formatDuration } from "@/utils/dateFormatters";

export const generateSummary = (
  doc: jsPDF,
  eventsByTimer: { [key: string]: TimeEntry[] },
  yOffset: number
): number => {
  doc.setFontSize(14);
  
  Object.entries(eventsByTimer).forEach(([timerName, timerEvents]) => {
    const totalSeconds = timerEvents.reduce((sum, event) => sum + event.seconds, 0);
    doc.text(`${timerName}: ${formatDuration(totalSeconds)}`, 40, yOffset);
    yOffset += 20;
  });

  return yOffset;
};