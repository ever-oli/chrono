import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimerContext } from "@/components/Timer/TimerContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function GoalForm() {
  const [selectedTimer, setSelectedTimer] = useState("");
  const [goalType, setGoalType] = useState<"target" | "limit">("target");
  const [threshold, setThreshold] = useState("");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const { timers } = useTimerContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: {
      timer_id: string;
      type: "target" | "limit";
      threshold_min?: number;
      threshold_max?: number;
      period: "daily" | "weekly" | "monthly";
      active: boolean;
    }) => {
      const { data, error } = await supabase
        .from("goals")
        .insert([goalData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Reset form
      setSelectedTimer("");
      setThreshold("");

      toast({
        title: "Success",
        description: "Goal created successfully",
      });

      // Invalidate and refetch goals query
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error: Error) => {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: `Failed to create goal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimer || !threshold) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      timer_id: selectedTimer,
      type: goalType,
      [goalType === "target" ? "threshold_min" : "threshold_max"]: parseInt(threshold),
      period,
      active: true,
    };

    createGoalMutation.mutate(goalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Select value={selectedTimer} onValueChange={setSelectedTimer}>
          <SelectTrigger>
            <SelectValue placeholder="Select Timer" />
          </SelectTrigger>
          <SelectContent>
            {timers.map((timer) => (
              <SelectItem key={timer.id} value={timer.id}>
                {timer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={goalType} onValueChange={(value: "target" | "limit") => setGoalType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Goal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="target">Target (Minimum)</SelectItem>
              <SelectItem value="limit">Limit (Maximum)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={period} onValueChange={(value: "daily" | "weekly" | "monthly") => setPeriod(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Input
        type="number"
        placeholder={`${goalType === "target" ? "Minimum" : "Maximum"} hours`}
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={createGoalMutation.isPending}
      >
        {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
      </Button>
    </form>
  );
}