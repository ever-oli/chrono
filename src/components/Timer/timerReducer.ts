import { TimerState, TimerAction } from '@/types/timerState';

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_TIMERS':
      return {
        ...state,
        timers: action.payload.reduce((acc, timer) => ({
          ...acc,
          [timer.id]: timer
        }), {}),
        isLoading: false
      };
    case 'START_TIMER':
      return {
        ...state,
        activeTimers: new Set([...state.activeTimers, action.payload.timerId]),
        currentEntries: {
          ...state.currentEntries,
          [action.payload.timerId]: action.payload.entry
        }
      };
    case 'STOP_TIMER': {
      const newActiveTimers = new Set(state.activeTimers);
      newActiveTimers.delete(action.payload.timerId);
      const { [action.payload.timerId]: _, ...remainingEntries } = state.currentEntries;
      return {
        ...state,
        activeTimers: newActiveTimers,
        currentEntries: remainingEntries
      };
    }
    case 'UPDATE_ENTRY':
      return {
        ...state,
        currentEntries: {
          ...state.currentEntries,
          [action.payload.timerId]: action.payload.entry
        }
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
}