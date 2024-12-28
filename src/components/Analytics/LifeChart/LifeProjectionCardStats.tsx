import { TimeUnit } from "./TimeUnitToggle";
import { formatDurationImpact } from "@/utils/lifeProjections";
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

  return (
    <motion.div 
      className="space-y-2"
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Weekly:</span>
        <span className="font-medium">{formatTime(projection.weekly)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Yearly:</span>
        <span className="font-medium">{formatTime(projection.yearly)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Lifetime:</span>
        <span className="font-medium">{formatTime(projection.lifetime)}</span>
      </div>
    </motion.div>
  );
}