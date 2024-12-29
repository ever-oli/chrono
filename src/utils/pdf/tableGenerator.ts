import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import { formatDuration } from "@/utils/dateFormatters";

export const generateTable = (
  doc: jsPDF, 
  events: TimeEntry[], 
  yOffset: number
) => {
  const tableData = events.map(event => [
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
    startY: yOffset + 20,
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
};