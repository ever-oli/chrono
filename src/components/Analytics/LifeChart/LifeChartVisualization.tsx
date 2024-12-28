import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LifeChartVisualizationProps } from "./types";
import CustomTooltip from "./CustomTooltip";
import { useMemo } from "react";
import { formatDuration } from "@/utils/dateFormatters";

const WAKING_HOURS_PER_DAY = 16; // Assuming 8 hours of sleep
const WEEKS_PER_YEAR = 52;

export default function LifeChartVisualization({
  data,
  currentAge,
  expectedLifespan
}: LifeChartVisualizationProps) {
  const activityColorMap = useMemo(() => {
    return data.reduce((acc, activity) => {
      acc[activity.name] = activity.color;
      return acc;
    }, {} as Record<string, string>);
  }, [data]);

  // Calculate yearly data based on weekly patterns
  const yearlyData = useMemo(() => {
    if (!data?.length) return [];

    const remainingYears = expectedLifespan - currentAge;
    if (remainingYears <= 0) return [];

    // Convert weekly hours to yearly for each activity
    const yearlyActivities = data.map(activity => ({
      name: activity.name,
      weeklyHours: Math.max(0, activity.hours || 0),
      yearlyHours: Math.max(0, (activity.hours || 0) * WEEKS_PER_YEAR),
      color: activity.color
    }));

    // Calculate lifetime hours for each activity
    const lifetimeData = yearlyActivities.map(activity => ({
      ...activity,
      lifetimeHours: activity.yearlyHours * remainingYears,
      percentOfWakingLife: (activity.yearlyHours * remainingYears) / 
        (WAKING_HOURS_PER_DAY * 365 * remainingYears) * 100
    }));

    // Create year-by-year projection
    return Array.from({ length: remainingYears }, (_, i) => {
      const age = currentAge + i;
      const yearData = {
        age,
        label: `Age ${age}`,
      };

      lifetimeData.forEach(activity => {
        yearData[activity.name] = activity.yearlyHours;
      });

      return yearData;
    });
  }, [data, currentAge, expectedLifespan]);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-medium mb-4">Life Projection (Based on Current Patterns)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {data.map((activity) => {
            const yearlyHours = activity.hours * WEEKS_PER_YEAR;
            const remainingYears = expectedLifespan - currentAge;
            const lifetimeHours = yearlyHours * remainingYears;
            const percentOfWakingLife = (lifetimeHours / 
              (WAKING_HOURS_PER_DAY * 365 * remainingYears)) * 100;
            
            return (
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
                  {formatDuration(lifetimeHours * 3600)} total
                </p>
                <p className="text-sm text-muted-foreground">
                  {percentOfWakingLife.toFixed(1)}% of waking life
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(activity.hours * 3600)} / week
                </p>
              </div>
            );
          })}
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={yearlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="label"
                interval={4}
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
    </div>
  );
}