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

export interface LifeChartVisualizationProps extends LifeChartControlsProps {
  data: LifeChartProps["data"];
}