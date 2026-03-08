export interface ScoreBreakdown {
  accuracyScore: number;
  retryPenalty: number;
  totalScore: number;
  stars: 1 | 2 | 3;
}

/**
 * Calculate a lesson score from accuracy and retry data.
 *
 * Formula:
 * - accuracyScore = (correct / total) * 70
 * - retryPenalty   = totalRetries * 5 (capped at 30)
 * - totalScore     = accuracyScore + 30 - retryPenalty (clamped 0-100)
 * - stars: 90+ = 3, 70-89 = 2, <70 = 1
 */
export function calculateScore({
  correctAnswers,
  totalQuestions,
  questionAttempts,
}: {
  correctAnswers: number;
  totalQuestions: number;
  questionAttempts: Record<number | string, number>;
}): ScoreBreakdown {
  const accuracyScore =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 70 : 0;

  const totalRetries = Object.values(questionAttempts).reduce(
    (sum, v) => sum + v,
    0,
  );
  const retryPenalty = Math.min(totalRetries * 5, 30);

  const rawTotal = accuracyScore + 30 - retryPenalty;
  const totalScore = Math.round(Math.max(0, Math.min(100, rawTotal)));

  const stars: 1 | 2 | 3 =
    totalScore >= 90 ? 3 : totalScore >= 70 ? 2 : 1;

  return {
    accuracyScore: Math.round(accuracyScore),
    retryPenalty: Math.round(retryPenalty),
    totalScore,
    stars,
  };
}
