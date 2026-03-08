import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";
import { TermMastery, nextReviewDate } from "@/lib/types/mastery";

const LOCAL_KEY = "term_masteries";

// ---------------------------------------------------------------------------
// Local storage
// ---------------------------------------------------------------------------

async function readLocal(): Promise<Record<string, TermMastery>> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeLocal(data: Record<string, TermMastery>) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Remote sync
// ---------------------------------------------------------------------------

async function syncToRemote(
  userId: string,
  mastery: TermMastery,
): Promise<void> {
  try {
    await supabase.from("term_mastery").upsert(
      {
        user_id: userId,
        term_key: mastery.termKey,
        pack_id: mastery.packId,
        mastery_level: mastery.masteryLevel,
        correct_count: mastery.correctCount,
        incorrect_count: mastery.incorrectCount,
        last_reviewed_at: mastery.lastReviewedAt,
        next_review_at: mastery.nextReviewAt,
      },
      { onConflict: "user_id,term_key" },
    );
  } catch {
    // Silently fail
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Update mastery for a term after review.
 */
export async function updateTermMastery(
  key: string,
  packId: string,
  correct: boolean,
  userId?: string,
): Promise<void> {
  if (!key || !packId) return;

  const all = await readLocal();
  const existing = all[key];
  const now = new Date().toISOString();

  if (existing) {
    if (correct) {
      existing.correctCount += 1;
      existing.masteryLevel = Math.min(5, existing.masteryLevel + 1) as TermMastery["masteryLevel"];
    } else {
      existing.incorrectCount += 1;
      existing.masteryLevel = Math.max(0, existing.masteryLevel - 1) as TermMastery["masteryLevel"];
    }
    existing.lastReviewedAt = now;
    existing.nextReviewAt = nextReviewDate(existing.masteryLevel);
    all[key] = existing;
  } else {
    const level = correct ? 1 : 0;
    all[key] = {
      termKey: key,
      packId,
      masteryLevel: level as TermMastery["masteryLevel"],
      correctCount: correct ? 1 : 0,
      incorrectCount: correct ? 0 : 1,
      lastReviewedAt: now,
      nextReviewAt: nextReviewDate(level),
    };
  }

  await writeLocal(all);

  if (userId) {
    await syncToRemote(userId, all[key]);
  }
}

/**
 * Get all term masteries. Prefers remote if userId provided.
 */
export async function getTermMasteries(
  userId?: string,
): Promise<Record<string, TermMastery>> {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("term_mastery")
        .select("*")
        .eq("user_id", userId);

      if (!error && data && data.length > 0) {
        const remote: Record<string, TermMastery> = {};
        for (const row of data) {
          remote[row.term_key] = {
            termKey: row.term_key,
            packId: row.pack_id,
            masteryLevel: row.mastery_level,
            correctCount: row.correct_count,
            incorrectCount: row.incorrect_count,
            lastReviewedAt: row.last_reviewed_at,
            nextReviewAt: row.next_review_at,
          };
        }
        // Merge with local
        const local = await readLocal();
        const merged = { ...remote };
        for (const [key, localMastery] of Object.entries(local)) {
          if (
            !merged[key] ||
            new Date(localMastery.lastReviewedAt) >
              new Date(merged[key].lastReviewedAt)
          ) {
            merged[key] = localMastery;
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

/**
 * Get terms that are due for review (nextReviewAt is in the past).
 * Also applies decay: if past nextReviewAt, drop mastery by 1.
 */
export async function getDueForReview(
  userId?: string,
): Promise<TermMastery[]> {
  const all = await getTermMasteries(userId);
  const now = new Date();
  const due: TermMastery[] = [];
  const decayed: TermMastery[] = [];

  for (const mastery of Object.values(all)) {
    if (mastery.masteryLevel > 0 && new Date(mastery.nextReviewAt) <= now) {
      // Apply decay
      mastery.masteryLevel = Math.max(0, mastery.masteryLevel - 1) as TermMastery["masteryLevel"];
      due.push(mastery);
      decayed.push(mastery);
    }
  }

  // Persist decayed mastery levels
  if (decayed.length > 0) {
    await writeLocal(all);
    if (userId) {
      for (const m of decayed) {
        await syncToRemote(userId, m);
      }
    }
  }

  return due;
}
