import { cn } from "@/lib/utils";

interface ActivityCardProps {
  name: string;
  time?: string;
  color: string;
  onClick?: () => void;
}

export function ActivityCard({ name, time, color, onClick }: ActivityCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent/10",
        "group flex items-center justify-between"
      )}
    >
      <div className="flex items-center gap-4">
        <div 
          className={cn(
            "h-4 w-1 rounded-full",
            color
          )} 
        />
        <span className="font-medium">{name}</span>
      </div>
      {time && (
        <span className="text-sm text-muted-foreground">{time}</span>
      )}
    </button>
  );
}