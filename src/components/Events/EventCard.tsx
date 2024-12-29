import { formatTime } from "@/utils/dateFormatters";
import { TimeEntry } from "@/types/timeEntry";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface EventCardProps {
  entry: TimeEntry;
  onDelete: (id: string) => void;
}

export default function EventCard({ entry, onDelete }: EventCardProps) {
  const duration = Math.floor(entry.seconds / 60);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const seconds = entry.seconds % 60;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: entry.timer?.color }}
        />
        <div>
          <h3 className="font-medium">{entry.timer?.name || 'Unnamed Timer'}</h3>
          <p className="text-sm text-muted-foreground">
            {formatTime(entry.started_at)} - {formatTime(entry.ended_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {hours > 0 ? `${hours}h ` : ''}
            {minutes > 0 ? `${minutes}m ` : ''}
            {seconds}s
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(entry.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}