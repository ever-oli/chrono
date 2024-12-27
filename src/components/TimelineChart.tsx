import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";

interface TimeData {
  name: string;
  value: number;
  color: string;
}

const initialData: TimeData[] = [];

export function TimelineChart({ activeActivity, activeTime }: { activeActivity?: string; activeTime?: number }) {
  const [data, setData] = useState<TimeData[]>(initialData);

  useEffect(() => {
    if (activeActivity && activeTime) {
      setData(prevData => {
        const newData = [...prevData];
        const activityIndex = newData.findIndex(item => item.name === activeActivity);
        
        if (activityIndex !== -1) {
          // Convert seconds to same unit as other values (assuming they're in minutes)
          const timeInMinutes = Math.floor(activeTime / 60);
          newData[activityIndex] = {
            ...newData[activityIndex],
            value: timeInMinutes
          };
        } else {
          // Add new activity if it doesn't exist
          newData.push({
            name: activeActivity,
            value: Math.floor(activeTime / 60),
            color: '#' + Math.floor(Math.random()*16777215).toString(16) // Generate random color for now
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