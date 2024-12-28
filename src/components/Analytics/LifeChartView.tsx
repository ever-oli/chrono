import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface CustomBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  age?: number;
  isHovered?: boolean;
}

interface LifeChartProps {
  data: Array<{
    name: string;
    hours: number;
    color: string;
  }>;
}

export default function LifeChartView({ data }: LifeChartProps) {
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);
  
  // Calculate total weekly hours from real data
  const totalWeeklyHours = useMemo(() => {
    return data.reduce((sum, entry) => sum + entry.hours, 0);
  }, [data]);
  
  // Project yearly data based on real weekly data
  const projectedData = useMemo(() => {
    // Current age and lifespan could be user settings in the future
    const currentAge = 30;
    const expectedLifespan = 80;
    const remainingYears = expectedLifespan - currentAge;
    
    // Convert weekly hours to yearly projection
    const yearlyHours = totalWeeklyHours * 52; // 52 weeks in a year
    
    // Create projected data points for each remaining year
    return Array.from({ length: remainingYears }, (_, i) => {
      const age = currentAge + i;
      return {
        age,
        projected: yearlyHours,
        label: `Age ${age}`,
        activities: data.map(activity => ({
          name: activity.name,
          hours: (activity.hours * 52), // yearly projection
          color: activity.color
        }))
      };
    });
  }, [data, totalWeeklyHours]);

  const CustomBar = ({ x, y, width, height, age }: CustomBarProps) => {
    const isHovered = hoveredAge === age;
    
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isHovered ? '#DC9E82' : '#C16E70'}
        className="transition-colors duration-200"
        opacity={isHovered ? 1 : 0.8}
      />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Life in Years</CardTitle>
        <Info className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={projectedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onMouseMove={(e: any) => {
                if (e && e.activePayload) {
                  setHoveredAge(e.activePayload[0].payload.age);
                }
              }}
              onMouseLeave={() => setHoveredAge(null)}
            >
              <XAxis
                dataKey="label"
                interval={4}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Projected Hours per Year',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 14 }
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card p-4 shadow-lg rounded-lg border">
                        <p className="font-semibold">Age {data.age}</p>
                        <div className="space-y-1 mt-2">
                          {data.activities.map((activity: any) => (
                            <div key={activity.name} className="flex justify-between items-center">
                              <span className="text-sm">{activity.name}:</span>
                              <span className="text-sm font-medium">
                                {Math.round(activity.hours)} hours
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm font-medium">
                            Total: {Math.round(data.projected)} hours
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="projected"
                shape={<CustomBar />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}