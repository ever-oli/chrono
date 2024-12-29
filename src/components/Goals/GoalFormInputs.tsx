import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Timer } from "@/types/timer";

interface GoalFormInputsProps {
  selectedTimer: string;
  setSelectedTimer: (value: string) => void;
  goalType: "target" | "limit";
  setGoalType: (value: "target" | "limit") => void;
  threshold: string;
  setThreshold: (value: string) => void;
  period: "daily" | "weekly" | "monthly";
  setPeriod: (value: "daily" | "weekly" | "monthly") => void;
  timers: Timer[];
}

export default function GoalFormInputs({
  selectedTimer,
  setSelectedTimer,
  goalType,
  setGoalType,
  threshold,
  setThreshold,
  period,
  setPeriod,
  timers,
}: GoalFormInputsProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}