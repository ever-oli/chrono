import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import { formatDuration } from "./dateFormatters";

const getDateRange = (period: string) => {
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

export const generateEventsPDF = async (events: TimeEntry[], period: string) => {
  const doc = new jsPDF();
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

  // Add header
  doc.setFontSize(20);
  doc.text(title, 20, 20);

  // Add statement info
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 30);

  let yOffset = 50;

  // Add summary for each timer
  Object.entries(eventsByTimer).forEach(([timerName, timerEvents]) => {
    const totalSeconds = timerEvents.reduce((sum, event) => sum + event.seconds, 0);
    doc.setFontSize(14);
    doc.text(`${timerName}: ${formatDuration(totalSeconds)}`, 20, yOffset);
    yOffset += 10;
  });

  yOffset += 10;

  // Add events table
  const tableData = filteredEvents.map(event => [
    format(parseISO(event.started_at), 'MMM dd, yyyy'),
    format(parseISO(event.started_at), 'hh:mm a'),
    event.ended_at ? format(parseISO(event.ended_at), 'hh:mm a') : 'N/A',
    event.timer?.name || 'Unnamed Timer',
    formatDuration(event.seconds),
    event.notes || '-'
  ]);

  autoTable(doc, {
    head: [['Date', 'Start Time', 'End Time', 'Activity', 'Duration', 'Notes']],
    body: tableData,
    startY: yOffset,
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [21, 30, 63],
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  try {
    // Save the PDF
    const fileName = `time-statement-${period}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};