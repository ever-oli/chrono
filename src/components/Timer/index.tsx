import { useState, useEffect } from "react";
import TimerDisplay from "./TimerDisplay";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface TimerProps {
  id: string;
  name: string;
  color: string;
  onDelete: (id: string) => void;
  onSecondsUpdate: (id: string, seconds: number) => void;
}

export default function Timer({ id, name, color, onDelete, onSecondsUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialSeconds = async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('seconds')
        .eq('timer_id', id);
      
      if (!error && data) {
        const totalSeconds = data.reduce((acc, entry) => acc + entry.seconds, 0);
        setSeconds(totalSeconds);
      }
    };

    loadInitialSeconds();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = async () => {
    if (!isRunning) {
      // Starting timer
      const now = new Date();
      setStartTime(now);
      setIsRunning(true);
    } else {
      // Stopping timer
      if (startTime) {
        const elapsedSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        
        // Calculate end time by adding elapsed seconds to start time
        const endTime = new Date(startTime.getTime() + (elapsedSeconds * 1000));
        
        const timeEntry = {
          timer_id: id,
          seconds: elapsedSeconds,
          started_at: startTime.toISOString(),
          ended_at: endTime.toISOString(),
          name: editName || name,
          notes: editNotes
        };

        const { error } = await supabase
          .from('time_entries')
          .insert([timeEntry]);

        if (!error) {
          await onSecondsUpdate(id, elapsedSeconds);
          queryClient.invalidateQueries({ queryKey: ['timers'] });
          toast({
            title: "Timer stopped",
            description: `Logged ${Math.floor(elapsedSeconds / 60)} minutes for ${name}`,
          });
        }
      }
      setIsRunning(false);
      setEditName("");
      setEditNotes("");
    }
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  return (
    <>
      <TimerDisplay
        id={id}
        name={name}
        color={color}
        seconds={seconds}
        isRunning={isRunning}
        onToggle={toggleTimer}
        onDelete={() => onDelete(id)}
        onEdit={handleEdit}
      />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timer Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Entry name (optional)"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder="Notes (optional)"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowEditDialog(false)}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}