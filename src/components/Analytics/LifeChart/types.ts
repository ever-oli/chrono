import { TimeUnit } from "./TimeUnitToggle";

export interface LifeChartProps {
  data: Array<{
    name: string;
    hours: number;
    color: string;
  }>;
}

export interface LifeChartControlsProps {
  currentAge: number;
  setCurrentAge: (age: number) => void;
  expectedLifespan: number;
  setExpectedLifespan: (lifespan: number) => void;
}

export interface LifeChartVisualizationProps {
  data: LifeChartProps["data"];
  currentAge: number;
  expectedLifespan: number;
  timeUnit: TimeUnit;
}