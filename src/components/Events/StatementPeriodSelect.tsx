import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface StatementPeriodSelectProps {
  onPeriodSelect: (value: string) => void;
}

export default function StatementPeriodSelect({ onPeriodSelect }: StatementPeriodSelectProps) {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i);
    return {
      value: `${currentYear}-${String(i + 1).padStart(2, '0')}`,
      label: format(date, 'MMMM yyyy')
    };
  });

  // Generate year options (current year + future years)
  const yearOptions = Array.from({ length: 77 }, (_, i) => currentYear + i);

  return (
    <Select onValueChange={onPeriodSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select statement period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="current-year">Current Year (Summary)</SelectItem>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
        {yearOptions.slice(1).map((year) => (
          <SelectItem key={year} value={`${year}`}>
            Year {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}