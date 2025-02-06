import { formatTime } from "@/utils/dateFormatters";
import { TimeEntry } from "@/types/timeEntry";
import { Button } from "@/components/ui/button";
import { Clock, Pencil } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NewEventForm from "./NewEventForm";
import { useState } from "react";

interface EventCardProps {
  entry: TimeEntry;
  onDelete: (id: string) => void;
}

export default function EventCard({ entry, onDelete }: EventCardProps) {
  const isMobile = useIsMobile();
  const duration = Math.floor(entry.seconds / 60);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const seconds = entry.seconds % 60;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} p-4 border rounded-lg space-y-2`}>
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
        <div className={`flex ${isMobile ? 'justify-between' : ''} items-center gap-4`}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {hours > 0 ? `${hours}h ` : ''}
              {minutes > 0 ? `${minutes}m ` : ''}
              {seconds}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <NewEventForm 
                  mode="edit"
                  initialData={{
                    id: entry.id,
                    name: entry.name || '',
                    notes: entry.notes || '',
                    timer_id: entry.timer_id,
                    marker_size: entry.marker_size || 'medium',
                    started_at: entry.started_at,
                    ended_at: entry.ended_at || ''
                  }}
                  onClose={() => setIsEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}