import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTimerContext } from "@/components/Timer/TimerContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GoalFormInputs from "./GoalFormInputs";
import GoalFormActions from "./GoalFormActions";

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
      setSelectedTimer("");
      setThreshold("");

      toast({
        title: "Success",
        description: "Goal created successfully",
      });

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
      <GoalFormInputs
        selectedTimer={selectedTimer}
        setSelectedTimer={setSelectedTimer}
        goalType={goalType}
        setGoalType={setGoalType}
        threshold={threshold}
        setThreshold={setThreshold}
        period={period}
        setPeriod={setPeriod}
        timers={timers}
      />
      <GoalFormActions isPending={createGoalMutation.isPending} />
    </form>
  );
}