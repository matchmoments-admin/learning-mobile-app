export type GoalType = "lessons";

export interface DailyGoalConfig {
  type: GoalType;
  target: number;
}

export interface DailyGoalProgress {
  config: DailyGoalConfig;
  currentDate: string;
  progress: number;
  completed: boolean;
}

export const GOAL_PRESETS: DailyGoalConfig[] = [
  { type: "lessons", target: 1 },
  { type: "lessons", target: 3 },
  { type: "lessons", target: 5 },
];
