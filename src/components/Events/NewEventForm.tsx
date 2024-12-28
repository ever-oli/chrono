import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTimerContext } from "@/components/Timer/TimerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface FormData {
  name: string;
  notes: string;
  timer_id: string;
  marker_size: 'small' | 'medium' | 'large';
  start_time: string;
  end_time: string;
}

interface NewEventFormProps {
  initialData?: {
    id: string;
    name?: string;
    notes?: string;
    timer_id: string;
    marker_size: 'small' | 'medium' | 'large';
    started_at: string;
    ended_at: string;
  };
  mode?: 'create' | 'edit';
}

export default function NewEventForm({ initialData, mode = 'create' }: NewEventFormProps) {
  const { timers } = useTimerContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      notes: initialData?.notes || '',
      timer_id: initialData?.timer_id || '',
      marker_size: initialData?.marker_size || 'medium',
      start_time: initialData?.started_at?.slice(0, 16) || new Date().toISOString().slice(0, 16),
      end_time: initialData?.ended_at?.slice(0, 16) || new Date().toISOString().slice(0, 16),
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const startDate = new Date(data.start_time);
      const endDate = new Date(data.end_time);
      const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

      const eventData = {
        name: data.name,
        notes: data.notes,
        timer_id: data.timer_id,
        marker_size: data.marker_size,
        started_at: startDate.toISOString(),
        ended_at: endDate.toISOString(),
        seconds: seconds
      };

      let error;

      if (mode === 'edit' && initialData) {
        const { error: updateError } = await supabase
          .from('time_entries')
          .update(eventData)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('time_entries')
          .insert([eventData]);
        error = insertError;
      }

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: mode === 'edit' ? "Event updated" : "Event created",
        description: mode === 'edit' 
          ? "Your event has been updated successfully."
          : "Your new event has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${mode} event: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          placeholder="Event name (optional)"
          {...register("name")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            type="datetime-local"
            {...register("start_time", { required: true })}
          />
          {errors.start_time && (
            <span className="text-sm text-red-500">Start time is required</span>
          )}
        </div>
        <div>
          <Input
            type="datetime-local"
            {...register("end_time", { required: true })}
          />
          {errors.end_time && (
            <span className="text-sm text-red-500">End time is required</span>
          )}
        </div>
      </div>

      <div>
        <select
          className="w-full border rounded-md h-10 px-3"
          {...register("timer_id", { required: true })}
        >
          <option value="">Select activity</option>
          {timers.map((timer) => (
            <option key={timer.id} value={timer.id}>
              {timer.name}
            </option>
          ))}
        </select>
        {errors.timer_id && (
          <span className="text-sm text-red-500">Activity is required</span>
        )}
      </div>

      <div>
        <select
          className="w-full border rounded-md h-10 px-3"
          {...register("marker_size")}
        >
          <option value="small">Small marker</option>
          <option value="medium">Medium marker</option>
          <option value="large">Large marker</option>
        </select>
      </div>

      <div>
        <Textarea
          placeholder="Notes (optional)"
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (mode === 'edit' ? "Updating..." : "Adding...") : (mode === 'edit' ? "Update Event" : "Add Event")}
        </Button>
      </div>
    </form>
  );
}