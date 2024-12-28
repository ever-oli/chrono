import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LifeChartVisualizationProps } from "./types";
import CustomTooltip from "./CustomTooltip";
import { useMemo } from "react";

export default function LifeChartVisualization({
  data,
  currentAge,
  expectedLifespan,
}: LifeChartVisualizationProps) {
  const projectedData = useMemo(() => {
    if (expectedLifespan <= currentAge) return [];
    
    const remainingYears = expectedLifespan - currentAge;
    
    const yearlyHoursByActivity = data.map(activity => ({
      name: activity.name,
      hours: (activity.hours / 7) * 365,
      color: activity.color
    }));
    
    return Array.from({ length: remainingYears }, (_, i) => {
      const age = currentAge + i;
      const yearData = {
        age,
        label: `Age ${age}`,
      };

      yearlyHoursByActivity.forEach(activity => {
        yearData[activity.name] = activity.hours;
      });

      return yearData;
    });
  }, [data, currentAge, expectedLifespan]);

  const activityColorMap = useMemo(() => {
    return data.reduce((acc, activity) => {
      acc[activity.name] = activity.color;
      return acc;
    }, {} as Record<string, string>);
  }, [data]);

  return (
    <div className="h-[400px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={projectedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="label"
            interval={4}
            tick={{ fontSize: 12, fill: '#666' }}
            stroke="#666"
            tickLine={{ stroke: '#666' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#666' }}
            stroke="#666"
            tickLine={{ stroke: '#666' }}
            label={{ 
              value: 'Projected Hours per Year',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 14, fill: '#666' }
            }}
          />
          <Tooltip
            content={({ active, payload }) => (
              <CustomTooltip
                active={active}
                payload={payload}
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
  );
}