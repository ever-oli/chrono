import { QueryClient } from '@tanstack/react-query';
import { Dispatch } from 'react';
import { TimerAction } from '@/types/timerState';
import { useTimerStartStop } from './hooks/useTimerStartStop';
import { useTimerCRUD } from './hooks/useTimerCRUD';
import { useTimerUpdate } from './hooks/useTimerUpdate';

export function useTimerActions(dispatch: Dispatch<TimerAction>, queryClient: QueryClient) {
  const { startTimer, stopTimer } = useTimerStartStop(dispatch);
  const { addTimer, deleteTimer } = useTimerCRUD(queryClient);
  const { updateTimerSeconds } = useTimerUpdate(dispatch);

  return {
    startTimer,
    stopTimer,
    addTimer,
    deleteTimer,
    updateTimerSeconds
  };
}