import { TimeUnit } from "@/components/Analytics/LifeChart/TimeUnitToggle";

export interface TimeProjection {
  weekly: number;
  yearly: number;
  lifetime: number;
  percentOfWakingLife: number;
}

export const HOURS_PER_DAY = 24;
export const DAYS_PER_YEAR = 365;
export const WAKING_HOURS_PER_DAY = 16; // Assuming 8 hours of sleep

export function calculatePercentChange(base: number, adjusted: number): number {
  return ((adjusted - base) / base) * 100;
}

export function formatTimeUnit(hours: number, timeUnit: TimeUnit): string {
  switch (timeUnit) {
    case "hours":
      return `${Math.round(hours).toLocaleString()} hours`;
    case "days":
      return `${Math.round(hours / HOURS_PER_DAY).toLocaleString()} days`;
    case "years":
      return `${(hours / (HOURS_PER_DAY * DAYS_PER_YEAR)).toFixed(1)} years`;
    default:
      return `${Math.round(hours).toLocaleString()} hours`;
  }
}

export function calculateLifeProjection(
  weeklyHours: number,
  currentAge: number,
  expectedLifespan: number
): TimeProjection {
  const remainingYears = Math.max(0, expectedLifespan - currentAge);
  const yearlyHours = weeklyHours * 52;
  const lifetimeHours = yearlyHours * remainingYears;
  const wakingLifetimeHours = WAKING_HOURS_PER_DAY * DAYS_PER_YEAR * remainingYears;
  
  return {
    weekly: weeklyHours,
    yearly: yearlyHours,
    lifetime: lifetimeHours,
    percentOfWakingLife: (lifetimeHours / wakingLifetimeHours) * 100
  };
}