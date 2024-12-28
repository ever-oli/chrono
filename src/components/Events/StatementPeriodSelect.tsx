import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";

interface StatementPeriodSelectProps {
  onPeriodSelect: (value: string) => void;
}

export default function StatementPeriodSelect({ onPeriodSelect }: StatementPeriodSelectProps) {
  const { data: periods = [] } = useQuery({
    queryKey: ['time-entry-periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('started_at')
        .order('started_at', { ascending: false });

      if (error) throw error;

      const uniquePeriods = new Set<string>();
      const currentYear = new Date().getFullYear();
      let hasCurrentYearData = false;

      data?.forEach(entry => {
        const date = parseISO(entry.started_at);
        const yearMonth = format(date, 'yyyy-MM');
        const year = format(date, 'yyyy');
        
        uniquePeriods.add(yearMonth);
        if (year === currentYear.toString()) {
          hasCurrentYearData = true;
        }
      });

      const periods = Array.from(uniquePeriods).map(period => {
        const [year, month] = period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          value: period,
          label: format(date, 'MMMM yyyy')
        };
      });

      // Add current year summary if there's data
      if (hasCurrentYearData) {
        periods.unshift({
          value: 'current-year',
          label: 'Current Year (Summary)'
        });
      }

      return periods;
    }
  });

  return (
    <Select onValueChange={onPeriodSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select statement period" />
      </SelectTrigger>
      <SelectContent>
        {periods.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}