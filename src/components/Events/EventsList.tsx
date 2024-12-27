import { format, isToday, parseISO } from "date-fns";

interface Event {
  id: string;
  name?: string;
  notes?: string;
  marker_size: 'small' | 'medium' | 'large';
  seconds: number;
  started_at: string;
  ended_at: string;
  timers: {
    id: string;
    name: string;
    color: string;
  };
}

interface EventsListProps {
  groupedEvents: {
    [key: string]: Event[];
  };
}

export default function EventsList({ groupedEvents }: EventsListProps) {
  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'h:mm a');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getDateHeader = (date: string) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) {
      return 'Today';
    }
    return format(parsedDate, 'EEEE, MMMM d');
  };

  const getMarkerSize = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'h-2';
      case 'large': return 'h-6';
      default: return 'h-4';
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedEvents).map(([date, events]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {getDateHeader(date)}
            </h2>
            <span className="text-sm text-gray-500">
              {events.length} events
            </span>
          </div>

          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="border rounded-lg p-4 relative overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-2 ${getMarkerSize(event.marker_size)}`}
                  style={{ backgroundColor: event.timers.color }}
                />
                <div className="pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">
                        {event.name || event.timers.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatTime(event.started_at)} → {formatTime(event.ended_at)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {formatDuration(event.seconds)}
                    </span>
                  </div>
                  {event.notes && (
                    <p className="text-sm text-gray-600 mt-2">{event.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}