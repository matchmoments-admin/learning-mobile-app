import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";

const LOCAL_KEY = "lesson_progress";

interface LessonProgressRecord {
  [lessonId: string]: number;
}

// ---------------------------------------------------------------------------
// Local (AsyncStorage) — offline-first fallback
// ---------------------------------------------------------------------------

async function readLocal(): Promise<LessonProgressRecord> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeLocal(data: LessonProgressRecord) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Supabase upsert
// ---------------------------------------------------------------------------

async function upsertRemote(
  userId: string,
  lessonId: string,
  count: number,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completion_count: count,
        last_completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Increment lesson completion count. Writes to both local and remote.
 */
export async function incrementLessonCompletion(
  lessonId: string,
  userId?: string,
): Promise<void> {
  // Always write locally first
  const progress = await readLocal();
  const newCount = (progress[lessonId] || 0) + 1;
  progress[lessonId] = newCount;
  await writeLocal(progress);

  // Try to sync to Supabase
  if (userId) {
    await upsertRemote(userId, lessonId, newCount);
  }
}

/**
 * Get all lesson progress. Prefers remote if available, falls back to local.
 */
export async function getAllProgress(
  userId?: string,
): Promise<LessonProgressRecord> {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completion_count")
        .eq("user_id", userId);

      if (!error && data && data.length > 0) {
        const remote: LessonProgressRecord = {};
        for (const row of data) {
          remote[row.lesson_id] = row.completion_count;
        }
        // Merge with local (local may have newer data from offline use)
        const local = await readLocal();
        const merged = { ...remote };
        for (const [id, count] of Object.entries(local)) {
          if ((merged[id] ?? 0) < count) {
            merged[id] = count;
          }
        }
        return merged;
      }
    } catch {
      // Fall through to local
    }
  }

  return readLocal();
}
