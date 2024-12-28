import { formatDuration } from "@/utils/dateFormatters";

interface SummaryData {
  name: string;
  seconds: number;
  color: string;
}

interface AnalyticsSummaryProps {
  data: SummaryData[];
}

export default function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between p-3 bg-secondary/20 border border-secondary/30 backdrop-blur-sm rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium">{item.name}</span>
          </div>
          <span>{formatDuration(item.seconds)}</span>
        </div>
      ))}
    </div>
  );
}