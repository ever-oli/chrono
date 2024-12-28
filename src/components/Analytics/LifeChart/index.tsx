import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LifeChartProps } from "./types";
import LifeChartHeader from "./LifeChartHeader";
import LifeChartControls from "./LifeChartControls";
import LifeChartVisualization from "./LifeChartVisualization";
import { ErrorBoundary } from "react-error-boundary";

export default function LifeChart({ data }: LifeChartProps) {
  const [currentAge, setCurrentAge] = useState<number>(25);
  const [expectedLifespan, setExpectedLifespan] = useState<number>(85);

  return (
    <ErrorBoundary
      fallback={
        <Card className="w-full bg-card/50 backdrop-blur-sm border-none shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Unable to load life chart visualization
            </div>
          </CardContent>
        </Card>
      }
    >
      <Card className="w-full bg-card/50 backdrop-blur-sm border-none shadow-lg">
        <LifeChartHeader />
        <CardContent>
          <LifeChartControls
            currentAge={currentAge}
            setCurrentAge={setCurrentAge}
            expectedLifespan={expectedLifespan}
            setExpectedLifespan={setExpectedLifespan}
          />
          <LifeChartVisualization
            data={data}
            currentAge={currentAge}
            setCurrentAge={setCurrentAge}
            expectedLifespan={expectedLifespan}
            setExpectedLifespan={setExpectedLifespan}
          />
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}