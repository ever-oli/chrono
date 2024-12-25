import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Work", value: 34, color: "bg-purple-500" },
  { name: "Exercise", value: 23, color: "bg-green-500" },
  { name: "Hobbies", value: 18, color: "bg-cyan-500" },
  { name: "Socializing", value: 15, color: "bg-yellow-500" },
  { name: "Education", value: 10, color: "bg-red-500" },
];

const COLORS = ["#9333EA", "#22C55E", "#06B6D4", "#EAB308", "#EF4444"];

export function TimelineChart() {
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}