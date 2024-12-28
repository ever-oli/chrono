import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import html2canvas from "html2canvas";

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

  if (period.includes('-')) {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month - 1);
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
      title: `Monthly Statement - ${format(date, 'MMMM yyyy')}`
    };
  }

  const year = parseInt(period);
  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
    title: `Year ${year} Statement`
  };
};

const captureChart = async (chartElement: HTMLElement): Promise<string> => {
  try {
    const canvas = await html2canvas(chartElement, {
      scale: 2,
      backgroundColor: null,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing chart:', error);
    throw error;
  }
};

export const generateEventsPDF = async (events: Event[], period: string) => {
  const doc = new jsPDF();
  const { title, start, end } = getDateRange(period);
  
  // Filter events based on date range
  const filteredEvents = events.filter(event => {
    const eventDate = parseISO(event.started_at);
    return eventDate >= start && eventDate <= end;
  });

  try {
    // Add header
    doc.setFontSize(20);
    doc.text(title, 20, 20);

    // Add statement info
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 30);
    
    const totalTime = filteredEvents.reduce((acc, event) => acc + event.seconds, 0);
    doc.text(`Total Time: ${formatDuration(totalTime)}`, 20, 40);

    // Capture and add charts
    const chartsContainer = document.querySelector('.grid-cols-2');
    if (chartsContainer) {
      const charts = Array.from(chartsContainer.children);
      if (charts.length >= 2) {
        // Add pie chart
        const pieChartImage = await captureChart(charts[0] as HTMLElement);
        doc.addImage(pieChartImage, 'PNG', 20, 50, 85, 85);
        
        // Add bar chart
        const barChartImage = await captureChart(charts[1] as HTMLElement);
        doc.addImage(barChartImage, 'PNG', 105, 50, 85, 85);
      }
    }

    // Add events table
    const tableData = filteredEvents.map(event => [
      format(parseISO(event.started_at), 'MMM dd, yyyy'),
      format(parseISO(event.started_at), 'hh:mm a'),
      format(parseISO(event.ended_at), 'hh:mm a'),
      event.name || event.timers.name,
      formatDuration(event.seconds),
      event.notes || '-'
    ]);

    autoTable(doc, {
      head: [['Date', 'Start Time', 'End Time', 'Activity', 'Duration', 'Notes']],
      body: tableData,
      startY: 150,
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

    // Save the PDF
    const fileName = `time-statement-${period}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};