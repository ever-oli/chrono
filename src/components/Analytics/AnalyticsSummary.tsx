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
          className="flex items-center justify-between p-3 rounded-lg"
          style={{
            backgroundColor: 'rgba(220, 158, 130, 0.15)', // Buff color with transparency
            backdropFilter: 'blur(5px)',
            boxShadow: '0 0 1rem 0 rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(220, 158, 130, 0.3)' // Subtle buff-colored border
          }}
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