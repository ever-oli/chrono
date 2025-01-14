import HabitGrid from "@/components/Goals/HabitGrid";

export default function Habits() {
  return (
    <div className="container max-w-[1200px] mx-auto p-4 md:p-content space-y-4 md:space-y-section">
      <div className="space-y-2 md:space-y-component">
        <h1 className="text-oxford-blue">Habits</h1>
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