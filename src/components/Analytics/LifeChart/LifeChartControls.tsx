import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LifeChartControlsProps } from "./types";

export default function LifeChartControls({
  currentAge,
  setCurrentAge,
  expectedLifespan,
  setExpectedLifespan,
}: LifeChartControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="currentAge">Current Age</Label>
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
        <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
        <Input
          id="lifeExpectancy"
          type="number"
          min={currentAge}
          value={expectedLifespan}
          onChange={(e) => setExpectedLifespan(Math.max(parseInt(e.target.value) || 0, currentAge))}
        />
      </div>
    </div>
  );
}