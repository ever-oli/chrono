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
  
  const totalWeeklyHours = useMemo(() => {
    return data.reduce((sum, entry) => sum + entry.hours, 0);
  }, [data]);
  
  const projectedData = useMemo(() => {
    const currentAge = 30;
    const expectedLifespan = 80;
    const remainingYears = expectedLifespan - currentAge;
    const yearlyHours = totalWeeklyHours * 52;
    
    return Array.from({ length: remainingYears }, (_, i) => {
      const age = currentAge + i;
      return {
        age,
        projected: yearlyHours,
        label: `Age ${age}`,
        activities: data.map(activity => ({
          name: activity.name,
          hours: (activity.hours * 52),
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
    <Card className="w-full bg-card/50 backdrop-blur-sm border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-foreground/90">Life in Years</CardTitle>
        <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mt-4">
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card/95 backdrop-blur-sm p-4 shadow-lg rounded-lg border border-border/50">
                        <p className="font-semibold text-foreground">Age {data.age}</p>
                        <div className="space-y-1.5 mt-2">
                          {data.activities.map((activity: any) => (
                            <div key={activity.name} className="flex justify-between items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: activity.color }}
                                />
                                <span className="text-sm text-muted-foreground">{activity.name}:</span>
                              </div>
                              <span className="text-sm font-medium text-foreground">
                                {Math.round(activity.hours)} hours
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <p className="text-sm font-medium text-foreground flex justify-between">
                            <span>Total:</span>
                            <span>{Math.round(data.projected)} hours</span>
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