import { DateRangeProvider, useDateRange } from "./DateRangeProvider";
import { useAnalyticsData } from "./useAnalyticsData";
import AnalyticsCharts from "./AnalyticsCharts";
import AnalyticsSummary from "./AnalyticsSummary";

interface AnalyticsProps {
  timeRange: "hours" | "days" | "weeks" | "months";
  currentDate: Date;
}

function AnalyticsContent({ timeRange, currentDate }: AnalyticsProps) {
  const { getDateRange } = useDateRange();
  const dateRange = getDateRange(timeRange, currentDate);
  const { data, isLoading } = useAnalyticsData(dateRange);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading analytics...
      </div>
    );
  }

  if (!data || data.chartData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No data available for this time period
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnalyticsCharts data={data.chartData} />
      <AnalyticsSummary data={data.aggregatedData} />
    </div>
  );
}

export default function Analytics(props: AnalyticsProps) {
  return (
    <DateRangeProvider>
      <AnalyticsContent {...props} />
    </DateRangeProvider>
  );
}