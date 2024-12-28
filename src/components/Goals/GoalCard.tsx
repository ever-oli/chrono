import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoalCardProps {
  id: string;
  timerName: string;
  type: "target" | "limit";
  threshold: number;
  period: "daily" | "weekly" | "monthly";
  progress: number;
  onDelete: (id: string) => void;
}

export default function GoalCard({
  id,
  timerName,
  type,
  threshold,
  period,
  progress,
  onDelete,
}: GoalCardProps) {
  const { toast } = useToast();
  const percentage = Math.min((progress / threshold) * 100, 100);
  const isNearThreshold = type === "limit" && percentage >= 80;

  const handleDelete = async () => {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
      return;
    }

    onDelete(id);
    toast({
      title: "Success",
      description: "Goal deleted successfully",
    });
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === "target" ? (
            <Target className="h-5 w-5 text-blue-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <h3 className="font-medium">{timerName}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {type === "target" ? "Target" : "Limit"}: {threshold} hours/{period}
          </span>
          <span>Progress: {Math.round(progress * 10) / 10} hours</span>
        </div>
        <Progress
          value={percentage}
          className={isNearThreshold ? "bg-red-100" : ""}
        />
      </div>

      {isNearThreshold && (
        <p className="text-sm text-red-500">
          Warning: Approaching {period} limit!
        </p>
      )}
    </div>
  );
}