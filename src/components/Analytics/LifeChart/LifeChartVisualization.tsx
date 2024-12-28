import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LifeChartVisualizationProps } from "./types";
import CustomTooltip from "./CustomTooltip";
import { useMemo } from "react";

export default function LifeChartVisualization({
  data,
}: Pick<LifeChartVisualizationProps, 'data'>) {
  const activityColorMap = useMemo(() => {
    return data.reduce((acc, activity) => {
      acc[activity.name] = activity.color;
      return acc;
    }, {} as Record<string, string>);
  }, [data]);

  // Convert weekly hours to yearly total (52 weeks)
  const yearlyData = useMemo(() => {
    const totalHours = data.reduce((sum, activity) => sum + activity.hours, 0);
    return [{
      period: 'Current Year',
      ...data.reduce((acc, activity) => {
        acc[activity.name] = Math.round(activity.hours * 52); // Scale to yearly
        return acc;
      }, {} as Record<string, number>),
      total: Math.round(totalHours * 52)
    }];
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-medium mb-4">Yearly Time Distribution (Based on Current Pattern)</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={yearlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12, fill: '#666' }}
                stroke="#666"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#666' }}
                stroke="#666"
                label={{ 
                  value: 'Hours per Year',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 14, fill: '#666' }
                }}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    {...props}
                    activityColorMap={activityColorMap}
                  />
                )}
              />
              {data.map((activity) => (
                <Bar
                  key={activity.name}
                  dataKey={activity.name}
                  stackId="a"
                  fill={activity.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((activity) => (
          <div
            key={activity.name}
            className="p-4 rounded-lg border"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activity.color }}
              />
              <h4 className="font-medium">{activity.name}</h4>
            </div>
            <p className="text-2xl font-bold">
              {Math.round(activity.hours * 52)} hours/year
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.hours} hours/week
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}