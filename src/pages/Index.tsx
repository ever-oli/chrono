import TimerList from "@/components/TimerList";
import Analytics from "@/components/Analytics";
import { TimerProvider } from "@/components/Timer/TimerContext";

export default function Index() {
  return (
    <TimerProvider>
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <TimerList />
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          <Analytics 
            timeRange="hours"
            currentDate={new Date()}
          />
        </div>
      </div>
    </TimerProvider>
  );
}