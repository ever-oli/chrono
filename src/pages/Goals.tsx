import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GoalForm from "@/components/Goals/GoalForm";
import GoalCard from "@/components/Goals/GoalCard";
import HabitGrid from "@/components/Goals/HabitGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { useGoalsSubscription } from "@/hooks/useGoalsSubscription";
import { Separator } from "@/components/ui/separator";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);

  // Enable real-time updates
  useGoalsSubscription();

  const { data: goals, isLoading, error } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      console.log("Fetching goals...");
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select(`
          *,
          timers (
            name
          )
        `)
        .eq("active", true);

      console.log("Goals query response:", { goalsData, goalsError });

      if (goalsError) throw goalsError;

      // Fetch time entries for progress calculation
      const now = new Date();
      const promises = goalsData.map(async (goal) => {
        let startDate;
        switch (goal.period) {
          case "daily":
            startDate = startOfDay(now);
            break;
          case "weekly":
            startDate = startOfWeek(now);
            break;
          case "monthly":
            startDate = startOfMonth(now);
            break;
          default:
            startDate = startOfDay(now);
        }

        const { data: entries, error: entriesError } = await supabase
          .from("time_entries")
          .select("seconds")
          .eq("timer_id", goal.timer_id)
          .gte("started_at", startDate.toISOString());

        console.log("Time entries for goal:", { goal, entries, entriesError });

        if (entriesError) throw entriesError;

        const totalHours = entries.reduce((acc, entry) => acc + entry.seconds / 3600, 0);
        
        return {
          ...goal,
          progress: totalHours
        };
      });

      const result = await Promise.all(promises);
      console.log("Final goals with progress:", result);
      return result;
    },
  });

  const handleDeleteGoal = (id: string) => {
    console.log("Goal deleted:", id);
  };

  if (error) {
    console.error("Error loading goals:", error);
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-8">
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
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading goals...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            Error loading goals. Please try again.
          </div>
        ) : goals?.length ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              timerName={goal.timers.name}
              type={goal.type}
              threshold={goal.type === "target" ? goal.threshold_min : goal.threshold_max}
              period={goal.period}
              progress={goal.progress}
              onDelete={handleDeleteGoal}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No goals yet. Click the + button to add one.
          </div>
        )}
      </div>

      <Separator className="my-8" />

      <div className="space-y-8">
        <HabitGrid />
      </div>
    </div>
  );
}