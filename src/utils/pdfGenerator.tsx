import { jsPDF } from "jspdf";
import { format, parseISO } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import { getDateRange } from "./pdf/dateUtils";
import { generateTable } from "./pdf/tableGenerator";
import { generateSummary } from "./pdf/summaryGenerator";

export const generateEventsPDF = async (events: TimeEntry[], period: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });
  
  const { title, start, end } = getDateRange(period);
  
  // Filter events based on date range
  const filteredEvents = events.filter(event => {
    const eventDate = parseISO(event.started_at);
    return eventDate >= start && eventDate <= end;
  });

  // Group events by timer
  const eventsByTimer = filteredEvents.reduce((acc: { [key: string]: TimeEntry[] }, event) => {
    const timerName = event.timer?.name || 'Unnamed Timer';
    if (!acc[timerName]) {
      acc[timerName] = [];
    }
    acc[timerName].push(event);
    return acc;
  }, {});

  try {
    // Start PDF content
    doc.setFontSize(24);
    doc.text(title, 40, 40);

    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 40, 60);

    let yOffset = 80;

    // Add summary for each timer
    yOffset = generateSummary(doc, eventsByTimer, yOffset);

    // Add events table
    generateTable(doc, filteredEvents, yOffset);

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 20,
        { align: 'center' }
      );
    }

    const fileName = `time-statement-${period}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};