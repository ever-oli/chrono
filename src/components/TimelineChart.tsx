import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";

interface TimeData {
  name: string;
  value: number;
  color: string;
}

export function TimelineChart({ activeActivity, activeTime }: { activeActivity?: string; activeTime?: number }) {
  const [data, setData] = useState<TimeData[]>([]);

  useEffect(() => {
    if (activeActivity && activeTime) {
      setData(prevData => {
        const newData = [...prevData];
        const activityIndex = newData.findIndex(item => item.name === activeActivity);
        
        if (activityIndex !== -1) {
          const timeInMinutes = Math.floor(activeTime / 60);
          newData[activityIndex] = {
            ...newData[activityIndex],
            value: timeInMinutes
          };
        } else {
          newData.push({
            name: activeActivity,
            value: Math.floor(activeTime / 60),
            color: '#' + Math.floor(Math.random()*16777215).toString(16)
          });
        }
        
        return newData;
      });
    }
  }, [activeActivity, activeTime]);

  const formatTooltip = (value: number) => {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${hours}h ${minutes}m`;
  };

  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No activities tracked yet
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={formatTooltip} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}