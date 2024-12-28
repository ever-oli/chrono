import { Card } from "@/components/ui/card";
import { TooltipProps } from "recharts";

interface TooltipData {
  name: string;
  hours: number;
  color: string;
}

interface CustomTooltipProps extends TooltipProps<any, any> {
  activityColorMap: Record<string, string>;
}

export default function CustomTooltip({ active, payload, activityColorMap }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const activities = Object.keys(data)
    .filter((key) => key !== "age" && key !== "label")
    .map((activityName) => ({
      name: activityName,
      hours: data[activityName],
      color: activityColorMap[activityName],
    }));

  const totalHours = activities.reduce((sum, activity) => sum + activity.hours, 0);

  return (
    <Card className="bg-card/95 backdrop-blur-sm p-4 shadow-lg rounded-lg border border-border/50">
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
    </Card>
  );
}