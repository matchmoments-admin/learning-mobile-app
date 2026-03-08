export type XpSource =
  | "lesson_complete"
  | "conversation_complete"
  | "conversation_turn"
  | "daily_login"
  | "perfect_lesson";

export interface XpEvent {
  source: XpSource;
  amount: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface XpState {
  totalXp: number;
  level: number;
  todayXp: number;
  todayDate: string;
}

export const XP_AWARDS: Record<XpSource, number> = {
  lesson_complete: 20,
  conversation_complete: 25,
  conversation_turn: 3,
  daily_login: 10,
  perfect_lesson: 15,
};

/** Level N requires N * 100 total XP */
export function levelForXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.floor(totalXp / 100) + 1;
}

/** XP needed to reach the next level from current totalXp */
export function xpForNextLevel(totalXp: number): number {
  const currentLevel = levelForXp(totalXp);
  const nextLevelXp = currentLevel * 100;
  return nextLevelXp - totalXp;
}

/** XP progress within current level (0 to 99) */
export function xpProgressInLevel(totalXp: number): number {
  return totalXp % 100;
}
