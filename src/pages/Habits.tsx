import HabitGrid from "@/components/Goals/HabitGrid";

export default function Habits() {
  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
        <p className="text-muted-foreground">
          Track your daily activities and build better habits.
        </p>
      </div>
      <HabitGrid />
    </div>
  );
}