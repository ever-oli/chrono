import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventsList from "@/components/Events/EventsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NewEventForm from "@/components/Events/NewEventForm";
import StatementPeriodSelect from "@/components/Events/StatementPeriodSelect";
import { generateEventsPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

export default function Events() {
  const { toast } = useToast();
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          seconds,
          started_at,
          ended_at,
          name,
          notes,
          marker_size,
          timer_id,
          timers (
            id,
            name,
            color
          )
        `)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      console.log('Fetched events:', data);
      return data;
    }
  });

  // Group events by date
  const groupedEvents = events.reduce((groups: any, event) => {
    const date = format(parseISO(event.started_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push({
      ...event,
      timer: event.timers // Map the nested timer data correctly
    });
    return groups;
  }, {});

  console.log('Grouped events:', groupedEvents);

  const handleExport = async (period: string) => {
    try {
      await generateEventsPDF(events, period);
      toast({
        title: "Export Successful",
        description: "Your statement has been generated.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your statement.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Events Log</h1>
        <div className="flex gap-4">
          <StatementPeriodSelect onPeriodSelect={handleExport} />
          
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