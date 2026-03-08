import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";
import {
  DailyGoalConfig,
  DailyGoalProgress,
} from "@/lib/types/daily-goal";

const LOCAL_KEY = "daily_goal";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultProgress(): DailyGoalProgress {
  return {
    config: { type: "lessons", target: 1 },
    currentDate: todayStr(),
    progress: 0,
    completed: false,
  };
}

// ---------------------------------------------------------------------------
// Local storage
// ---------------------------------------------------------------------------

async function readLocal(): Promise<DailyGoalProgress> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : getDefaultProgress();
  } catch {
    return getDefaultProgress();
  }
}

async function writeLocal(state: DailyGoalProgress) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// Remote sync
// ---------------------------------------------------------------------------

async function syncConfigToRemote(
  userId: string,
  config: DailyGoalConfig,
): Promise<void> {
  try {
    await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        daily_goal_target: config.target,
        daily_goal_type: config.type,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch {
    // Silently fail
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Set the daily goal configuration.
 */
export async function setDailyGoal(
  config: DailyGoalConfig,
  userId?: string,
): Promise<void> {
  if (
    !Number.isInteger(config.target) ||
    config.target < 1 ||
    config.target > 20
  ) {
    throw new Error("Daily goal target must be an integer between 1 and 20");
  }

  const state = await readLocal();
  state.config = config;
  // Reset progress if target changed
  state.progress = 0;
  state.completed = false;
  state.currentDate = todayStr();
  await writeLocal(state);

  if (userId) {
    await syncConfigToRemote(userId, config);
  }
}

/**
 * Get daily goal progress. Resets if it's a new day.
 */
export async function getDailyGoalProgress(
  userId?: string,
): Promise<DailyGoalProgress> {
  let state = await readLocal();
  const today = todayStr();

  // If remote has a different config, prefer that
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("daily_goal_target, daily_goal_type")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        state.config = {
          type: (data.daily_goal_type as "lessons") ?? "lessons",
          target: data.daily_goal_target ?? 1,
        };
      }
    } catch {
      // Use local config
    }
  }

  // Reset progress if new day
  if (state.currentDate !== today) {
    state.progress = 0;
    state.completed = false;
    state.currentDate = today;
    await writeLocal(state);
  }

  return state;
}

/**
 * Increment goal progress by 1. Returns updated progress.
 */
export async function incrementGoalProgress(
  userId?: string,
): Promise<DailyGoalProgress> {
  const state = await getDailyGoalProgress(userId);

  if (!state.completed) {
    state.progress += 1;
    state.completed = state.progress >= state.config.target;
  }

  await writeLocal(state);
  return state;
}
