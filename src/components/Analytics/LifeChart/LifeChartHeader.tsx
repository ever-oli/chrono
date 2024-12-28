import { Info } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

export default function LifeChartHeader() {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-semibold text-foreground/90">Life in Years</CardTitle>
      <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
    </CardHeader>
  );
}