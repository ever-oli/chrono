import { formatTime } from "@/utils/dateFormatters";
import { TimeEntry } from "@/types/timeEntry";
import { Button } from "@/components/ui/button";
import { Clock, Pencil } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  const [newEndTime, setNewEndTime] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update newEndTime whenever the dialog opens or entry changes
  useEffect(() => {
    if (isEditDialogOpen && entry.ended_at) {
      // Format the date to local datetime-local format
      const date = new Date(entry.ended_at);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      setNewEndTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [isEditDialogOpen, entry.ended_at]);

  const handleEndTimeUpdate = async () => {
    setIsSubmitting(true);
    try {
      const endDate = new Date(newEndTime);
      const startDate = new Date(entry.started_at);
      const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

      const { error } = await supabase
        .from('time_entries')
        .update({
          ended_at: endDate.toISOString(),
          seconds: seconds
        })
        .eq('id', entry.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Time updated",
        description: "The event end time has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update end time: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit End Time</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Input
                      type="datetime-local"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEndTimeUpdate}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>
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