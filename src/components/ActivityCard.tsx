import { cn } from "@/lib/utils";
import { Timer } from "./Timer";
import { useState } from "react";

interface ActivityCardProps {
  name: string;
  time?: string;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
  onTimeUpdate?: (time: number) => void;
}

export function ActivityCard({ 
  name, 
  time, 
  color, 
  isActive,
  onTimeUpdate
}: ActivityCardProps) {
  const [showTimer, setShowTimer] = useState(false);

  const handleClick = () => {
    setShowTimer(!showTimer);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        className={cn(
          "relative w-full rounded-lg border p-3 text-left transition-colors",
          isActive ? "bg-accent/20" : "hover:bg-accent/10",
          "group flex items-center justify-between overflow-hidden"
        )}
      >
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1.5",
            color
          )} 
        />
        <div className="flex items-center gap-3 pl-3">
          <span className="font-medium text-sm">{name}</span>
        </div>
        {time && (
          <span className="text-xs text-muted-foreground">{time}</span>
        )}
      </button>
      {showTimer && (
        <div className="pl-8">
          <Timer 
            activity={name} 
            onTimeUpdate={onTimeUpdate}
            allowMultiple={true}
          />
        </div>
      )}
    </div>
  );
}