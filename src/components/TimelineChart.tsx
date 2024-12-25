import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";

interface TimeData {
  name: string;
  value: number;
  color: string;
}

const initialData: TimeData[] = [
  { name: "Work", value: 34, color: "#9333EA" },
  { name: "Exercise", value: 23, color: "#22C55E" },
  { name: "Hobbies", value: 18, color: "#06B6D4" },
  { name: "Socializing", value: 15, color: "#EAB308" },
  { name: "Education", value: 10, color: "#EF4444" },
];

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
        }
        
        return newData;
      });
    }
  }, [activeActivity, activeTime]);

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
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}