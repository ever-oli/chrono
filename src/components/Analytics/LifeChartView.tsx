import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
}

interface LifeChartProps {
  data: Array<{
    name: string;
    hours: number;
    color: string;
  }>;
}

export default function LifeChartView({ data }: LifeChartProps) {
  const [currentAge, setCurrentAge] = useState<number>(25);
  const [expectedLifespan, setExpectedLifespan] = useState<number>(85);
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);
  
  const totalDailyHours = useMemo(() => {
    return data.reduce((sum, entry) => sum + entry.hours, 0);
  }, [data]);
  
  const projectedData = useMemo(() => {
    if (expectedLifespan <= currentAge) return [];
    
    const remainingYears = expectedLifespan - currentAge;
    
    // Convert weekly hours to yearly hours (daily hours × 365)
    const yearlyHoursByActivity = data.map(activity => ({
      name: activity.name,
      hours: (activity.hours / 7) * 365, // Convert weekly hours to daily, then multiply by days in year
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
    <Card className="w-full bg-card/50 backdrop-blur-sm border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-foreground/90">Life in Years</CardTitle>
        <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="currentAge">Current Age</Label>
            <Input
              id="currentAge"
              type="number"
              min="0"
              max={expectedLifespan}
              value={currentAge}
              onChange={(e) => setCurrentAge(Math.min(parseInt(e.target.value) || 0, expectedLifespan))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
            <Input
              id="lifeExpectancy"
              type="number"
              min={currentAge}
              value={expectedLifespan}
              onChange={(e) => setExpectedLifespan(Math.max(parseInt(e.target.value) || 0, currentAge))}
            />
          </div>
        </div>
        
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
                    const activities = Object.keys(data)
                      .filter(key => key !== 'age' && key !== 'label')
                      .map(activityName => ({
                        name: activityName,
                        hours: data[activityName],
                        color: activityColorMap[activityName]
                      }));

                    const totalHours = activities.reduce((sum, activity) => sum + activity.hours, 0);

                    return (
                      <div className="bg-card/95 backdrop-blur-sm p-4 shadow-lg rounded-lg border border-border/50">
                        <p className="font-semibold text-foreground">Age {data.age}</p>
                        <div className="space-y-1.5 mt-2">
                          {activities.map((activity) => (
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
                            <span>{Math.round(totalHours)} hours</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
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
      </CardContent>
    </Card>
  );
}