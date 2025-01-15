import HabitGrid from "@/components/Goals/HabitGrid";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Habits() {
  return (
    <div className="container max-w-[1200px] mx-auto p-4 md:p-content space-y-4 md:space-y-section">
      <div className="space-y-2 md:space-y-component">
        <div className="flex items-center gap-2">
          <h1 className="text-oxford-blue">Habits</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] p-4 space-y-2">
                <p className="font-medium">How it works:</p>
                <ul className="text-sm space-y-1.5">
                  <li>• Each column represents a week, with dots arranged vertically from Sunday (top) to Saturday (bottom)</li>
                  <li>• Activities are shown with a one-day delay to ensure complete 24-hour data</li>
                  <li>• Today's activities will appear in tomorrow's update</li>
                  <li>• Track your progress over time with this GitHub-inspired activity grid</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-space-cadet">
          Track your daily activities and build better habits.
        </p>
      </div>

      <div className="bg-beige rounded-lg shadow-frosted backdrop-blur-frosted border border-oxford-blue/5 p-3 md:p-6 overflow-x-auto">
        <HabitGrid />
      </div>
    </div>
  );
}