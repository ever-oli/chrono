import { TimeUnit } from "./TimeUnitToggle";
import { formatTimeUnit } from "@/utils/lifeChartCalculations";
import { motion } from "framer-motion";

interface LifeProjectionCardStatsProps {
  projection: {
    weekly: number;
    yearly: number;
    lifetime: number;
  };
  timeUnit: TimeUnit;
}

export default function LifeProjectionCardStats({
  projection,
  timeUnit,
}: LifeProjectionCardStatsProps) {
  return (
    <motion.div 
      className="space-y-2"
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Weekly:</span>
        <span className="font-medium">{formatTimeUnit(projection.weekly, timeUnit)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Yearly:</span>
        <span className="font-medium">{formatTimeUnit(projection.yearly, timeUnit)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Lifetime:</span>
        <span className="font-medium">{formatTimeUnit(projection.lifetime, timeUnit)}</span>
      </div>
    </motion.div>
  );
}