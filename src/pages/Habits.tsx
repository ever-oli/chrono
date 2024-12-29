import HabitGrid from "@/components/Goals/HabitGrid";

export default function Habits() {
  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Habits</h1>
      <HabitGrid />
    </div>
  );
}