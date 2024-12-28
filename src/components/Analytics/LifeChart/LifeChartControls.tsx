import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LifeChartControlsProps } from "./types";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TimeUnitToggle, { TimeUnit } from "./TimeUnitToggle";

interface ExtendedLifeChartControlsProps extends LifeChartControlsProps {
  timeUnit: TimeUnit;
  onTimeUnitChange: (unit: TimeUnit) => void;
}

export default function LifeChartControls({
  currentAge,
  setCurrentAge,
  expectedLifespan,
  setExpectedLifespan,
  timeUnit,
  onTimeUnitChange,
}: ExtendedLifeChartControlsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="currentAge">Current Age</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your current age to calculate life projections</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
          <div className="flex items-center gap-2">
            <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your expected lifespan to see lifetime projections</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="lifeExpectancy"
            type="number"
            min={currentAge}
            value={expectedLifespan}
            onChange={(e) => setExpectedLifespan(Math.max(parseInt(e.target.value) || 0, currentAge))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Time Unit</Label>
        <TimeUnitToggle value={timeUnit} onValueChange={onTimeUnitChange} />
      </div>
    </div>
  );
}