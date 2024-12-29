import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/dateFormatters";
import { TimeEntry } from "@/types/timeEntry";
import { useToast } from "@/components/ui/use-toast";
import EventCard from "./EventCard";

export default function EventsList() {
  const { toast } = useToast();

  const { data: entries, isLoading } = useQuery({
    queryKey: ["timeEntries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select(`
          *,
          timer:timer_id (
            name,
            color
          )
        `)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as TimeEntry[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading entries...
      </div>
    );
  }

  if (!entries?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No entries yet. Start a timer to begin tracking time.
      </div>
    );
  }

  // Group entries by date
  const groupedEntries = entries.reduce((groups: Record<string, TimeEntry[]>, entry) => {
    const date = entry.started_at.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groupedEntries).map(([date, dayEntries]) => (
        <div key={date} className="space-y-4">
          <h2 className="font-semibold">
            {formatDate(date)}
          </h2>
          <div className="space-y-2">
            {dayEntries.map((entry) => (
              <EventCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}