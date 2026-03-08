export interface TermMastery {
  termKey: string;
  packId: string;
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: string;
  nextReviewAt: string;
}

/** Review intervals in days by mastery level */
export const REVIEW_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

/**
 * Generate a stable key for a term based on nativeScript + translation.
 * Uses a simple hash to avoid key collision issues.
 */
export function termKey(nativeScript: string, translation: string): string {
  const escapeColons = (s: string) => s.replace(/:/g, "\\:");
  return `${escapeColons(nativeScript)}::${escapeColons(translation)}`;
}

/**
 * Calculate the next review date for a given mastery level.
 */
export function nextReviewDate(masteryLevel: number): string {
  const days = REVIEW_INTERVALS[masteryLevel] ?? 1;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
