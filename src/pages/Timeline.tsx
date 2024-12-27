import Analytics from "@/components/Analytics";
import { useTimerContext } from "@/components/Timer/TimerContext";

export default function Timeline() {
  const { timers } = useTimerContext();

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Timeline</h1>
      <Analytics timers={timers} />
    </div>
  );
}