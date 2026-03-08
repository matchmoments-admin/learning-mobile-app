import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";

const LOCAL_KEY = "user_streak";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
}

function getDefaultState(): StreakState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakStartDate: null,
  };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Local storage
// ---------------------------------------------------------------------------

async function readLocal(): Promise<StreakState> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

async function writeLocal(state: StreakState) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// Remote sync
// ---------------------------------------------------------------------------

async function syncToRemote(
  userId: string,
  state: StreakState,
): Promise<void> {
  try {
    await supabase.from("user_streaks").upsert(
      {
        user_id: userId,
        current_streak: state.currentStreak,
        longest_streak: state.longestStreak,
        last_activity_date: state.lastActivityDate,
        streak_start_date: state.streakStartDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    // Also update legacy user_stats.streak_days if it exists
    await supabase
      .from("user_stats")
      .update({ streak_days: state.currentStreak })
      .eq("user_id", userId);
  } catch {
    // Silently fail
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record activity for today. Updates streak accordingly:
 * - Same day: no-op
 * - Yesterday: increment streak
 * - Older: reset streak to 1
 */
export async function recordActivity(userId?: string): Promise<void> {
  const state = await readLocal();
  const today = todayStr();

  if (state.lastActivityDate === today) {
    return; // Already recorded today
  }

  if (state.lastActivityDate === yesterdayStr()) {
    // Continuing the streak
    state.currentStreak += 1;
  } else {
    // Starting a new streak
    state.currentStreak = 1;
    state.streakStartDate = today;
  }

  state.lastActivityDate = today;
  state.longestStreak = Math.max(state.longestStreak, state.currentStreak);

  await writeLocal(state);

  if (userId) {
    await syncToRemote(userId, state);
  }
}

/**
 * Get current streak state. Prefers remote if userId provided.
 */
export async function getStreakState(userId?: string): Promise<StreakState> {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        const state: StreakState = {
          currentStreak: data.current_streak ?? 0,
          longestStreak: data.longest_streak ?? 0,
          lastActivityDate: data.last_activity_date ?? null,
          streakStartDate: data.streak_start_date ?? null,
        };
        const local = await readLocal();
        if (local.currentStreak > state.currentStreak) {
          return local;
        }
        return state;
      }
    } catch {
      // Fall through to local
    }
  }

  return readLocal();
}
