import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO } from "date-fns";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventsList from "@/components/Events/EventsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NewEventForm from "@/components/Events/NewEventForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEventsPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";

export default function Events() {
  const { toast } = useToast();
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          name,
          notes,
          marker_size,
          seconds,
          started_at,
          ended_at,
          timers (
            id,
            name,
            color
          )
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Group events by date
  const groupedEvents = events.reduce((groups: any, event) => {
    const date = format(parseISO(event.started_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  const handleExport = async (timeframe: string) => {
    try {
      await generateEventsPDF(events, timeframe);
      toast({
        title: "Export Successful",
        description: `Your ${timeframe} report has been generated.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating your report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Events Log</h1>
        <div className="flex gap-4">
          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Export as PDF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <NewEventForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading events...</div>
      ) : (
        <EventsList groupedEvents={groupedEvents} />
      )}
    </div>
  );
}