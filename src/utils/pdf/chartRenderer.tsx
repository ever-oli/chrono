import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import html2canvas from 'html2canvas';

interface ChartData {
  name: string;
  hours: number;
  color: string;
}

export const generateChartImage = async (chartRef: HTMLElement): Promise<string> => {
  // Wait for chart to render fully (especially important for iOS Safari)
  await new Promise(r => setTimeout(r, 250));
  
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2, // Increase resolution
    logging: false,
    useCORS: true,
    width: 600, // Explicit dimensions for iOS Safari
    height: 300
  });
  
  return canvas.toDataURL('image/png');
};

export const renderCharts = (chartData: ChartData[]) => {
  // Create a temporary div with iOS Safari-friendly dimensions
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = `
    width: 600px;
    height: 300px;
    background-color: #ffffff;
    position: absolute;
    left: -9999px;
    top: 0;
    overflow: hidden;
  `;
  document.body.appendChild(tempDiv);

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