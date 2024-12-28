import { Card } from "@/components/ui/card";
import { calculateTimeProjection, formatDurationImpact } from "@/utils/lifeProjections";
import { formatDuration } from "@/utils/dateFormatters";

interface LifeProjectionCardProps {
  name: string;
  weeklyHours: number;
  color: string;
  currentAge: number;
  expectedLifespan: number;
}

export default function LifeProjectionCard({
  name,
  weeklyHours,
  color,
  currentAge,
  expectedLifespan
}: LifeProjectionCardProps) {
  const projection = calculateTimeProjection(weeklyHours, currentAge, expectedLifespan);
  
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: color }}
        />
        <h3 className="font-medium">{name}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Weekly:</span>
          <span className="font-medium">{formatDuration(projection.weekly * 3600)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Yearly:</span>
          <span className="font-medium">{formatDuration(projection.yearly * 3600)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Lifetime:</span>
          <span className="font-medium">{formatDurationImpact(projection.lifetime)}</span>
        </div>
      </div>
      
      <div className="pt-2 border-t">
        <p className="text-sm text-muted-foreground">
          {projection.percentOfWakingLife.toFixed(1)}% of remaining waking life
        </p>
      </div>
    </Card>
  );
}