import { Card } from "@/components/ui/card";
import { calculateTimeProjection, formatDurationImpact } from "@/utils/lifeProjections";
import { formatDuration } from "@/utils/dateFormatters";
import { TimeUnit } from "./TimeUnitToggle";
import { Badge } from "@/components/ui/badge";

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
  const projection = calculateTimeProjection(weeklyHours, currentAge, expectedLifespan);
  
  const formatTime = (hours: number) => {
    switch (timeUnit) {
      case "hours":
        return `${Math.round(hours)} hours`;
      case "days":
        return `${Math.round(hours / 24)} days`;
      case "years":
        return `${(hours / (24 * 365)).toFixed(1)} years`;
      default:
        return formatDuration(hours * 3600);
    }
  };
  
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <h3 className="font-medium">{name}</h3>
        </div>
        <Badge variant="secondary">
          {projection.percentOfWakingLife.toFixed(1)}% of life
        </Badge>
      </div>
      
      <div className="space-y-2">
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
      </div>
      
      <div className="pt-2 border-t">
        <p className="text-sm text-muted-foreground">
          That's {formatDurationImpact(projection.lifetime)} of your remaining waking life
        </p>
      </div>
    </Card>
  );
}