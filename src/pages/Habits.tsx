import HabitGrid from "@/components/Goals/HabitGrid";

export default function Habits() {
  return (
    <div className="container max-w-[1200px] mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-beige tracking-tight">Habits</h1>
        <p className="text-buff">
          Track your daily activities and build better habits.
        </p>
      </div>
      <div className="bg-beige rounded-xl shadow-card p-6">
        <HabitGrid />
      </div>
    </div>
  );
}