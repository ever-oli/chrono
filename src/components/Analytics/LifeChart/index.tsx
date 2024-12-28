import { Card, CardContent } from "@/components/ui/card";
import { LifeChartProps } from "./types";
import LifeChartHeader from "./LifeChartHeader";
import LifeChartVisualization from "./LifeChartVisualization";
import { ErrorBoundary } from "react-error-boundary";

export default function LifeChart({ data }: LifeChartProps) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="w-full bg-card/50 backdrop-blur-sm border-none shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Unable to load time distribution visualization
            </div>
          </CardContent>
        </Card>
      }
    >
      <Card className="w-full bg-card/50 backdrop-blur-sm border-none shadow-lg">
        <LifeChartHeader />
        <CardContent>
          <LifeChartVisualization data={data} />
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}