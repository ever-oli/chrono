import PieChart from "./PieChart";
import BarChart from "./BarChart";

interface ChartData {
  name: string;
  hours: number;
  color: string;
}

interface AnalyticsChartsProps {
  data: ChartData[];
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const pieChartData = data.map(item => ({
    name: item.name,
    value: item.hours,
    color: item.color
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <PieChart data={pieChartData} />
      <BarChart data={data} />
    </div>
  );
}