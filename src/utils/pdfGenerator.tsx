import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { TimeEntry } from "@/types/timeEntry";
import { formatDuration } from "./dateFormatters";
import { PieChart, Pie, Cell } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import React from "react";
import ReactDOMServer from "react-dom/server";

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

const generateChartImage = async (chartRef: HTMLElement): Promise<string> => {
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2, // Increase resolution
    logging: false,
    useCORS: true
  });
  return canvas.toDataURL('image/png');
};

const renderCharts = (chartData: any[]) => {
  // Create a temporary div with controlled dimensions
  const tempDiv = document.createElement('div');
  tempDiv.style.width = '600px';
  tempDiv.style.height = '300px';
  tempDiv.style.backgroundColor = '#ffffff';
  document.body.appendChild(tempDiv);

  // Render pie chart with explicit dimensions
  const pieChart = (
    <PieChart width={600} height={300}>
      <Pie
        data={chartData}
        dataKey="hours"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label={({ name, value }) => `${name}: ${value.toFixed(2)}h`}
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  );

  // Render bar chart with explicit dimensions
  const barChart = (
    <BarChart width={600} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis 
        label={{ 
          value: 'Time (hours)', 
          angle: -90, 
          position: 'insideLeft' 
        }} 
      />
      <Bar dataKey="hours">
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  );

  return { pieChart, barChart, tempDiv };
};

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

  // Render and add charts with proper positioning
  const { pieChart, barChart, tempDiv } = renderCharts(chartData);

  // Add pie chart
  ReactDOMServer.renderToString(pieChart);
  const pieChartImage = await generateChartImage(tempDiv);
  doc.addImage(pieChartImage, 'PNG', 40, yOffset, 500, 250);
  yOffset += 270;

  // Add bar chart
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
    if (yOffset > 700) { // Check if we need a new page
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

  try {
    const fileName = `time-statement-${period}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};