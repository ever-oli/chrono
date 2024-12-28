import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface Event {
  id: string;
  name?: string;
  notes?: string;
  seconds: number;
  started_at: string;
  ended_at: string;
  timers: {
    name: string;
    color: string;
  };
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const generateEventsPDF = async (events: Event[], timeframe: string) => {
  const doc = new jsPDF();
  const now = new Date();
  
  // Filter events based on timeframe
  const startDate = timeframe === 'month' ? startOfMonth(now) : startOfYear(now);
  const endDate = timeframe === 'month' ? endOfMonth(now) : endOfYear(now);
  
  const filteredEvents = events.filter(event => {
    const eventDate = parseISO(event.started_at);
    return eventDate >= startDate && eventDate <= endDate;
  });

  // Add header
  doc.setFontSize(20);
  doc.text(
    `Time Tracking Report - ${timeframe === 'month' ? format(now, 'MMMM yyyy') : format(now, 'yyyy')}`,
    20,
    20
  );

  // Add summary
  const totalTime = filteredEvents.reduce((acc, event) => acc + event.seconds, 0);
  doc.setFontSize(12);
  doc.text(`Total Time: ${formatDuration(totalTime)}`, 20, 30);

  // Create table data
  const tableData = filteredEvents.map(event => [
    format(parseISO(event.started_at), 'MMM dd, yyyy'),
    format(parseISO(event.started_at), 'hh:mm a'),
    format(parseISO(event.ended_at), 'hh:mm a'),
    event.name || event.timers.name,
    formatDuration(event.seconds),
    event.notes || '-'
  ]);

  // Add table
  autoTable(doc, {
    head: [['Date', 'Start Time', 'End Time', 'Activity', 'Duration', 'Notes']],
    body: tableData,
    startY: 40,
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

  // Save the PDF
  doc.save(`time-tracking-${timeframe}-${format(now, 'yyyy-MM')}.pdf`);
};