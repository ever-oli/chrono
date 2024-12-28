interface SummaryData {
  name: string;
  seconds: number;
  color: string;
}

interface AnalyticsSummaryProps {
  data: SummaryData[];
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export default function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between p-3 bg-secondary rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium">{item.name}</span>
          </div>
          <span>{formatTime(item.seconds)}</span>
        </div>
      ))}
    </div>
  );
}