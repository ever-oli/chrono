import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GoalForm from "@/components/Goals/GoalForm";
import GoalCard from "@/components/Goals/GoalCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);

  const { data: goals, refetch } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select(`
          *,
          timers (
            name
          )
        `)
        .eq("active", true);

      if (error) throw error;
      return data;
    },
  });

  const handleDeleteGoal = () => {
    refetch();
  };

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel("goals-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goals",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="ghost"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-card">
          <GoalForm />
        </div>
      )}

      <div className="space-y-4">
        {goals?.map((goal) => (
          <GoalCard
            key={goal.id}
            id={goal.id}
            timerName={goal.timers.name}
            type={goal.type}
            threshold={goal.type === "target" ? goal.threshold_min : goal.threshold_max}
            period={goal.period}
            progress={0} // TODO: Calculate actual progress
            onDelete={handleDeleteGoal}
          />
        ))}
        {goals?.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No goals yet. Click the + button to add one.
          </div>
        )}
      </div>
    </div>
  );
}