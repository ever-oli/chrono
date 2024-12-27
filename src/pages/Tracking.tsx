import TimerList from "@/components/TimerList";
import { TimerProvider } from "@/components/Timer/TimerContext";

export default function Tracking() {
  return (
    <TimerProvider>
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <TimerList />
      </div>
    </TimerProvider>
  );
}