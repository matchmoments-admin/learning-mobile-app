import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";
import { ScoreBreakdown } from "@/lib/types/scoring";

const LOCAL_KEY = "lesson_scores";

interface ScoreRecord {
  [lessonId: string]: number; // best totalScore
}

// ---------------------------------------------------------------------------
// Local storage
// ---------------------------------------------------------------------------

async function readLocal(): Promise<ScoreRecord> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeLocal(data: ScoreRecord) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Save a score for a lesson. Only updates if new score > existing best.
 */
export async function saveScore(
  lessonId: string,
  score: ScoreBreakdown,
  userId?: string,
): Promise<void> {
  const scores = await readLocal();
  const existing = scores[lessonId] ?? 0;

  if (score.totalScore > existing) {
    scores[lessonId] = score.totalScore;
    await writeLocal(scores);

    // Update best_accuracy in lesson_progress (reuses existing column)
    if (userId) {
      try {
        await supabase.from("lesson_progress").upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            best_accuracy: score.totalScore,
            last_completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" },
        );
      } catch {
        // Silently fail
      }
    }
  }
}

/**
 * Get best score for a lesson.
 */
export async function getBestScore(
  lessonId: string,
  userId?: string,
): Promise<number> {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("best_accuracy")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (!error && data?.best_accuracy != null) {
        return data.best_accuracy;
      }
    } catch {
      // Fall through to local
    }
  }

  const scores = await readLocal();
  return scores[lessonId] ?? 0;
}
