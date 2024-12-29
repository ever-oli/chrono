import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ReactDOMServer from "react-dom/server";
import { format, parseISO } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import { formatDuration } from "@/utils/dateFormatters";
import { generateChartImage, renderCharts } from "./chartRenderer";
import { getDateRange } from "./dateUtils";

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

  // Prepare chart data
  const chartData = Object.entries(eventsByTimer).map(([timerName, timerEvents]) => ({
    name: timerName,
    hours: timerEvents.reduce((sum, event) => sum + event.seconds / 3600, 0),
    color: timerEvents[0].timer?.color || '#cccccc'
  }));

  // Start PDF content
  doc.setFontSize(24);
  doc.text(title, 40, 40);

  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 40, 60);

  let yOffset = 80;

  try {
    // Render and add charts with proper positioning for iOS Safari
    const { pieChart, barChart, tempDiv } = renderCharts(chartData);

    // Add pie chart with iOS Safari considerations
    ReactDOMServer.renderToString(pieChart);
    const pieChartImage = await generateChartImage(tempDiv);
    doc.addImage(pieChartImage, 'PNG', 40, yOffset, 500, 250);
    yOffset += 270;

    // Add bar chart with iOS Safari considerations
    ReactDOMServer.renderToString(barChart);
    const barChartImage = await generateChartImage(tempDiv);
    doc.addImage(barChartImage, 'PNG', 40, yOffset, 500, 250);
    yOffset += 270;

    // Clean up temp div
    document.body.removeChild(tempDiv);

    // Add summary for each timer
    doc.setFontSize(14);
    Object.entries(eventsByTimer).forEach(([timerName, timerEvents]) => {
      const totalSeconds = timerEvents.reduce((sum, event) => sum + event.seconds, 0);
      if (yOffset > 700) {
        doc.addPage();
        yOffset = 40;
      }
      doc.text(`${timerName}: ${formatDuration(totalSeconds)}`, 40, yOffset);
      yOffset += 20;
    });

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