const WEEKS_PER_YEAR = 52;
const HOURS_PER_DAY = 24;
const DAYS_PER_YEAR = 365;
const WAKING_HOURS_PER_DAY = 16; // Assuming 8 hours of sleep

export interface TimeProjection {
  weekly: number;
  yearly: number;
  lifetime: number;
  percentOfWakingLife: number;
}

export function calculateTimeProjection(
  weeklyHours: number,
  currentAge: number,
  expectedLifespan: number
): TimeProjection {
  const remainingYears = Math.max(0, expectedLifespan - currentAge);
  const yearlyHours = weeklyHours * WEEKS_PER_YEAR;
  const lifetimeHours = yearlyHours * remainingYears;
  const wakingLifetimeHours = WAKING_HOURS_PER_DAY * DAYS_PER_YEAR * remainingYears;
  
  return {
    weekly: weeklyHours,
    yearly: yearlyHours,
    lifetime: lifetimeHours,
    percentOfWakingLife: (lifetimeHours / wakingLifetimeHours) * 100
  };
}

export function formatDurationImpact(hours: number): string {
  const days = hours / HOURS_PER_DAY;
  const years = days / DAYS_PER_YEAR;
  
  if (years >= 1) {
    return `${years.toFixed(1)} years`;
  } else if (days >= 1) {
    return `${Math.round(days)} days`;
  }
  return `${Math.round(hours)} hours`;
}