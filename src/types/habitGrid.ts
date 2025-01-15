import { TimeEntry } from "./timeEntry";

export interface DayActivity {
  date: Date;
  totalSeconds: number;
  entries: TimeEntry[];
  intensity: number;
}

export interface GridCell {
  date: Date;
  row: number;
  column: number;
  activity?: DayActivity;
}

export interface GridContentProps {
  weeks: Date[][];
  entriesByDate: Record<string, TimeEntry[]>;
  maxIntensity: number;
  color: string;
}