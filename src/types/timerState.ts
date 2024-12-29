import { Timer } from './timer';
import { TimeEntry } from './timeEntry';

export interface TimerState {
  timers: Record<string, Timer>;
  activeTimers: Set<string>;
  currentEntries: Record<string, TimeEntry>;
  isLoading: boolean;
  error: Error | null;
}

export type TimerAction =
  | { type: 'SET_TIMERS'; payload: Timer[] }
  | { type: 'START_TIMER'; payload: { timerId: string; entry: TimeEntry } }
  | { type: 'STOP_TIMER'; payload: { timerId: string } }
  | { type: 'UPDATE_ENTRY'; payload: { timerId: string; entry: TimeEntry } }
  | { type: 'SET_ERROR'; payload: Error };

export interface TimerContextType {
  state: TimerState;
  dispatch: React.Dispatch<TimerAction>;
  timers: Timer[];
  startTimer: (timerId: string) => Promise<void>;
  stopTimer: (timerId: string, currentEntry?: TimeEntry) => Promise<void>;
  addTimer: (timer: Omit<Timer, 'id' | 'created_at'>) => Promise<void>;
  deleteTimer: (id: string) => Promise<void>;
  updateTimerSeconds: (id: string, seconds: number) => Promise<void>;
}