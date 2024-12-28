import { Card } from "@/components/ui/card";
import { calculateTimeProjection, formatDurationImpact } from "@/utils/lifeProjections";
import { TimeUnit } from "./TimeUnitToggle";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  
  const formatTime = (hours: number) => {
    switch (timeUnit) {
      case "hours":
        return `${Math.round(hours).toLocaleString()} hours`;
      case "days":
        return `${Math.round(hours / 24).toLocaleString()} days`;
      case "years":
        return `${(hours / (24 * 365)).toFixed(1)} years`;
      default:
        return `${Math.round(hours).toLocaleString()} hours`;
    }
  };
  
  const percentChange = ((adjustedProjection.lifetime - baseProjection.lifetime) / baseProjection.lifetime) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 space-y-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            />
            <h3 className="font-medium">{name}</h3>
          </div>
          <Badge variant="secondary" className="transition-all duration-300">
            {adjustedProjection.percentOfWakingLife.toFixed(1)}% of life
          </Badge>
        </div>
        
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
                  onValueChange={(value) => setAdjustedHours(value[0])}
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
        
        <motion.div 
          className="space-y-2"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Weekly:</span>
            <span className="font-medium">{formatTime(adjustedProjection.weekly)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Yearly:</span>
            <span className="font-medium">{formatTime(adjustedProjection.yearly)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lifetime:</span>
            <span className="font-medium">{formatTime(adjustedProjection.lifetime)}</span>
          </div>
        </motion.div>
        
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
