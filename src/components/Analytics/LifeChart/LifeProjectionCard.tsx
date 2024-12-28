import { Card } from "@/components/ui/card";
import { calculateTimeProjection, formatDurationImpact } from "@/utils/lifeProjections";
import { TimeUnit } from "./TimeUnitToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import LifeProjectionCardHeader from "./LifeProjectionCardHeader";
import LifeProjectionCardSlider from "./LifeProjectionCardSlider";
import LifeProjectionCardStats from "./LifeProjectionCardStats";

interface LifeProjectionCardProps {
  name: string;
  weeklyHours: number;
  color: string;
  currentAge: number;
  expectedLifespan: number;
  timeUnit: TimeUnit;
}

export default function LifeProjectionCard({
  name,
  weeklyHours,
  color,
  currentAge,
  expectedLifespan,
  timeUnit
}: LifeProjectionCardProps) {
  const [adjustedHours, setAdjustedHours] = useState(weeklyHours);
  const [isAdjusting, setIsAdjusting] = useState(false);
  
  const baseProjection = calculateTimeProjection(weeklyHours, currentAge, expectedLifespan);
  const adjustedProjection = calculateTimeProjection(adjustedHours, currentAge, expectedLifespan);
  
  const percentChange = ((adjustedProjection.lifetime - baseProjection.lifetime) / baseProjection.lifetime) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 space-y-4 hover:shadow-lg transition-shadow duration-300">
        <LifeProjectionCardHeader
          name={name}
          color={color}
          percentOfWakingLife={adjustedProjection.percentOfWakingLife}
        />
        
        <LifeProjectionCardSlider
          isAdjusting={isAdjusting}
          weeklyHours={weeklyHours}
          adjustedHours={adjustedHours}
          percentChange={percentChange}
          onAdjustedHoursChange={setAdjustedHours}
        />
        
        <LifeProjectionCardStats
          projection={adjustedProjection}
          timeUnit={timeUnit}
        />
        
        <div className="pt-2 border-t">
          <button
            onClick={() => setIsAdjusting(!isAdjusting)}
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
              "w-full text-center"
            )}
          >
            {isAdjusting ? "Hide adjustment" : "Adjust time"}
          </button>
          <p className="text-sm text-muted-foreground mt-2">
            {formatDurationImpact(adjustedProjection.lifetime)} of your remaining waking life
          </p>
        </div>
      </Card>
    </motion.div>
  );
}