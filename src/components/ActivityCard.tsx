import { cn } from "@/lib/utils";

interface ActivityCardProps {
  name: string;
  time?: string;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function ActivityCard({ 
  name, 
  time, 
  color, 
  onClick,
  isActive 
}: ActivityCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full rounded-lg border p-3 text-left transition-colors",
        isActive ? "bg-accent/20" : "hover:bg-accent/10",
        "group flex items-center justify-between"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            "h-4 w-1 rounded-full",
            color
          )} 
        />
        <span className="font-medium text-sm">{name}</span>
      </div>
      {time && (
        <span className="text-xs text-muted-foreground">{time}</span>
      )}
    </button>
  );
}