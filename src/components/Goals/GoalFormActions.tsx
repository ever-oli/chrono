import { Button } from "@/components/ui/button";

interface GoalFormActionsProps {
  isPending: boolean;
}

export default function GoalFormActions({ isPending }: GoalFormActionsProps) {
  return (
    <Button 
      type="submit" 
      className="w-full"
      disabled={isPending}
    >
      {isPending ? "Creating..." : "Create Goal"}
    </Button>
  );
}