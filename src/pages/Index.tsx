import { Timer } from "@/components/Timer";

export default function Index() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Simple Timer</h1>
      </div>
      <Timer />
    </div>
  );
}