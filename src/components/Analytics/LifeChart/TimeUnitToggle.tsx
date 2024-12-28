import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type TimeUnit = "hours" | "days" | "years";

interface TimeUnitToggleProps {
  value: TimeUnit;
  onValueChange: (value: TimeUnit) => void;
}

export default function TimeUnitToggle({ value, onValueChange }: TimeUnitToggleProps) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(val) => val && onValueChange(val as TimeUnit)}>
      <ToggleGroupItem value="hours" aria-label="Show in hours">
        Hours
      </ToggleGroupItem>
      <ToggleGroupItem value="days" aria-label="Show in days">
        Days
      </ToggleGroupItem>
      <ToggleGroupItem value="years" aria-label="Show in years">
        Years
      </ToggleGroupItem>
    </ToggleGroup>
  );
}