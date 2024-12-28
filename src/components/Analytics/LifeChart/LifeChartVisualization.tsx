import { Card } from "@/components/ui/card";
import { LifeChartVisualizationProps } from "./types";
import LifeProjectionCard from "./LifeProjectionCard";

export default function LifeChartVisualization({
  data,
  currentAge,
  expectedLifespan
}: LifeChartVisualizationProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-medium mb-4">Life Projection (Based on Current Patterns)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((activity) => (
            <LifeProjectionCard
              key={activity.name}
              name={activity.name}
              weeklyHours={activity.hours}
              color={activity.color}
              currentAge={currentAge}
              expectedLifespan={expectedLifespan}
            />
          ))}
        </div>
      </div>
    </div>
  );
}