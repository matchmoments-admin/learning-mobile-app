import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";
import { logLearningEvent } from "./event-service";
import {
  XpSource,
  XpState,
  XP_AWARDS,
  levelForXp,
} from "@/lib/types/xp";

const LOCAL_KEY = "user_xp";

function getDefaultState(): XpState {
  return {
    totalXp: 0,
    level: 1,
    todayXp: 0,
    todayDate: new Date().toISOString().slice(0, 10),
  };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Local storage
// ---------------------------------------------------------------------------

async function readLocal(): Promise<XpState> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

async function writeLocal(state: XpState) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// Remote sync
// ---------------------------------------------------------------------------

async function syncToRemote(userId: string, state: XpState): Promise<void> {
  try {
    await supabase.from("user_xp").upsert(
      {
        user_id: userId,
        total_xp: state.totalXp,
        level: state.level,
        today_xp: state.todayXp,
        today_date: state.todayDate,
        last_xp_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch {
    // Silently fail — local is canonical
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Award XP for a given source. Returns the amount awarded.
 */
export async function awardXp(
  source: XpSource,
  userId?: string,
  metadata?: Record<string, unknown>,
): Promise<number> {
  const amount = XP_AWARDS[source];
  const state = await readLocal();
  const today = todayStr();

  // Reset today counters if new day
  if (state.todayDate !== today) {
    state.todayXp = 0;
    state.todayDate = today;
  }

  state.totalXp += amount;
  state.todayXp += amount;
  state.level = levelForXp(state.totalXp);

  await writeLocal(state);

  if (userId) {
    await syncToRemote(userId, state);
    void logLearningEvent(userId, "xp_awarded", {
      source,
      amount,
      totalXp: state.totalXp,
      ...metadata,
    });
  }

  return amount;
}

/**
 * Get current XP state. Prefers remote if userId provided.
 */
export async function getXpState(userId?: string): Promise<XpState> {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        const state: XpState = {
          totalXp: data.total_xp ?? 0,
          level: data.level ?? 1,
          todayXp: data.today_xp ?? 0,
          todayDate: data.today_date ?? todayStr(),
        };
        // Merge: take the higher of local and remote
        const local = await readLocal();
        if (local.totalXp > state.totalXp) {
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

/**
 * Check and award daily login XP if not already awarded today.
 */
export async function checkAndAwardDailyLogin(
  userId?: string,
): Promise<void> {
  const state = await readLocal();
  const today = todayStr();

  if (state.todayDate !== today) {
    await awardXp("daily_login", userId);
  }
}
