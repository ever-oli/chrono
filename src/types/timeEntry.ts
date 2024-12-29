export interface TimeEntry {
  id: string;
  timer_id: string;
  seconds: number;
  started_at: string;
  ended_at: string | null;
  name: string | null;
  notes: string | null;
  marker_size: 'small' | 'medium' | 'large' | null;
}