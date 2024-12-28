import { Info } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LifeChartHeader() {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-semibold text-foreground/90">Life in Perspective</CardTitle>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px] p-4 space-y-2">
            <p className="font-medium">How it works:</p>
            <ul className="text-sm space-y-1.5">
              <li>• View your current time allocation patterns projected over your lifetime</li>
              <li>• Adjust the sliders to see how changes impact your time distribution</li>
              <li>• See breakdowns in hours, days, or years</li>
              <li>• Percentages show portion of waking life (assuming 8 hours sleep daily)</li>
              <li>• Projections based on your current age and life expectancy</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </CardHeader>
  );
}