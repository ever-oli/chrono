import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";

export type TimeUnit = "hours" | "days" | "years";

interface TimeUnitToggleProps {
  value: TimeUnit;
  onValueChange: (value: TimeUnit) => void;
}

export default function TimeUnitToggle({ value, onValueChange }: TimeUnitToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={(val) => val && onValueChange(val as TimeUnit)}
        className="relative"
      >
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
    </motion.div>
  );
}