import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

interface LifeProjectionCardSliderProps {
  isAdjusting: boolean;
  weeklyHours: number;
  adjustedHours: number;
  percentChange: number;
  onAdjustedHoursChange: (value: number) => void;
}

export default function LifeProjectionCardSlider({
  isAdjusting,
  weeklyHours,
  adjustedHours,
  percentChange,
  onAdjustedHoursChange,
}: LifeProjectionCardSliderProps) {
  return (
    <AnimatePresence>
      {isAdjusting && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-2"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0h</span>
              <span>{Math.round(weeklyHours * 2)}h / week</span>
            </div>
            <Slider
              value={[adjustedHours]}
              onValueChange={(value) => onAdjustedHoursChange(value[0])}
              min={0}
              max={Math.max(weeklyHours * 2, 40)}
              step={0.5}
              className="my-4"
            />
          </div>
          {percentChange !== 0 && (
            <div className="text-sm">
              <span className={percentChange > 0 ? "text-green-500" : "text-red-500"}>
                {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}% change
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}