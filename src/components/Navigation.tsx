import { Link, useLocation } from "react-router-dom";
import { Clock, List, Target, CalendarDays, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimerContext } from "@/components/Timer/TimerContext";

export default function Navigation() {
  const location = useLocation();
  const { state } = useTimerContext();
  
  const links = [
    { to: "/", icon: Clock, label: "Tracking" },
    { to: "/events", icon: List, label: "Events" },
    { to: "/timeline", icon: BarChart, label: "Timeline" },
    { to: "/goals", icon: Target, label: "Goals" },
    { to: "/habits", icon: CalendarDays, label: "Habits" },
  ];

  // Check if any timers are running using the activeTimers Set from context
  const hasRunningTimers = state.activeTimers.size > 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="container max-w-2xl mx-auto">
        <div className="flex justify-between items-center px-4">
          {links.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            const isTracking = to === "/" && hasRunningTimers;
            
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center py-2 px-3 min-w-[4rem]",
                  "text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "text-blue-500",
                  isTracking && "text-green-500"
                )}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                  {isTracking && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
                  )}
                </div>
                <span className="text-xs mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}