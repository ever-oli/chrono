import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import _ from "lodash";
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

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

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
  const canvas = await html2canvas(chartElement, {
    scale: 2,
    backgroundColor: null,
  });
  return canvas.toDataURL('image/png');
};

export const generateEventsPDF = async (events: Event[], period: string) => {
  const doc = new jsPDF();
  const { title, start, end } = getDateRange(period);
  
  // Filter events based on date range
  const filteredEvents = events.filter(event => {
    const eventDate = parseISO(event.started_at);
    return eventDate >= start && eventDate <= end;
  });

  // Add header
  doc.setFontSize(20);
  doc.text(title, 20, 20);

  // Add statement info
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 30);
  
  const totalTime = filteredEvents.reduce((acc, event) => acc + event.seconds, 0);
  doc.text(`Total Time: ${formatDuration(totalTime)}`, 20, 40);

  // Prepare analytics data
  const analyticsData = _.chain(filteredEvents)
    .groupBy(event => event.timers.name)
    .map((events, name) => ({
      name,
      hours: _.sumBy(events, 'seconds') / 3600,
      color: events[0].timers.color
    }))
    .value();

  // Create temporary chart elements
  const chartsContainer = document.createElement('div');
  chartsContainer.style.width = '800px';
  chartsContainer.style.height = '300px';
  chartsContainer.style.position = 'absolute';
  chartsContainer.style.left = '-9999px';
  document.body.appendChild(chartsContainer);

  // Render and capture charts
  const Analytics = (await import('@/components/Analytics/AnalyticsCharts')).default;
  const root = document.createElement('div');
  chartsContainer.appendChild(root);

  // @ts-ignore - We know this exists in the window object
  const { createRoot } = window.ReactDOM;
  const reactRoot = createRoot(root);
  reactRoot.render(<Analytics data={analyticsData} />);

  // Wait for charts to render
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Capture charts
    const chartElements = chartsContainer.querySelectorAll('.h-[300px]');
    const [pieChartImage, barChartImage] = await Promise.all(
      Array.from(chartElements).map(element => captureChart(element as HTMLElement))
    );

    // Add charts to PDF
    const chartWidth = 85;
    const chartHeight = 85;
    doc.addImage(pieChartImage, 'PNG', 20, 50, chartWidth, chartHeight);
    doc.addImage(barChartImage, 'PNG', 105, 50, chartWidth, chartHeight);

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
  } finally {
    // Cleanup
    reactRoot.unmount();
    document.body.removeChild(chartsContainer);
  }
};