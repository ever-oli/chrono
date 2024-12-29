import HabitGrid from "@/components/Goals/HabitGrid";

export default function Habits() {
  return (
    <div className="container max-w-[1200px] mx-auto p-content space-y-section">
      <div className="space-y-component">
        <h1 className="text-oxford-blue">Habits</h1>
        <p className="text-space-cadet">
          Track your daily activities and build better habits.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-card p-6">
        <HabitGrid />
      </div>
    </div>
  );
}