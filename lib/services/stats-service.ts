import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";

const LOCAL_KEY = "speaking_listening_stats";
const MINUTES_PER_QUESTION = 0.5;
const MINUTES_PER_CONVERSATION_TURN = 1;

export interface UserStats {
  minutesSpoken: number;
  minutesListened: number;
  questionsAnswered: number;
  questionsListened: number;
  conversationTurns: number;
  lastUpdate: string;
}

// ---------------------------------------------------------------------------
// Local storage
// ---------------------------------------------------------------------------

function getDefaultStats(): UserStats {
  return {
    minutesSpoken: 0,
    minutesListened: 0,
    questionsAnswered: 0,
    questionsListened: 0,
    conversationTurns: 0,
    lastUpdate: new Date().toISOString(),
  };
}

async function readLocal(): Promise<UserStats> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : getDefaultStats();
  } catch {
    return getDefaultStats();
  }
}

async function writeLocal(stats: UserStats) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(stats));
}

// ---------------------------------------------------------------------------
// Remote sync
// ---------------------------------------------------------------------------

async function syncToRemote(userId: string, stats: UserStats): Promise<void> {
  try {
    await supabase.from("user_stats").upsert(
      {
        user_id: userId,
        minutes_spoken: stats.minutesSpoken,
        minutes_listened: stats.minutesListened,
        questions_answered: stats.questionsAnswered,
        questions_listened: stats.questionsListened,
        conversation_turns: stats.conversationTurns,
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: "user_id,COALESCE(pack_id, '__global__')" },
    );
  } catch {
    // Silently fail — local data is canonical, syncs on next attempt
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function recordQuestionAnswered(userId?: string) {
  const stats = await readLocal();
  stats.questionsAnswered += 1;
  stats.minutesSpoken = stats.questionsAnswered * MINUTES_PER_QUESTION;
  stats.lastUpdate = new Date().toISOString();
  await writeLocal(stats);
  if (userId) await syncToRemote(userId, stats);
}

export async function recordQuestionListened(userId?: string) {
  const stats = await readLocal();
  stats.questionsListened += 1;
  stats.minutesListened = stats.questionsListened * MINUTES_PER_QUESTION;
  stats.lastUpdate = new Date().toISOString();
  await writeLocal(stats);
  if (userId) await syncToRemote(userId, stats);
}

export async function recordConversationTurn(userId?: string) {
  const stats = await readLocal();
  stats.conversationTurns += 1;
  stats.minutesSpoken += MINUTES_PER_CONVERSATION_TURN;
  stats.minutesListened += MINUTES_PER_CONVERSATION_TURN;
  stats.lastUpdate = new Date().toISOString();
  await writeLocal(stats);
  if (userId) await syncToRemote(userId, stats);
}

export async function getWeeklyStats(userId?: string) {
  // Try remote first if user is available
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        return {
          minutesSpoken: Math.round((data.minutes_spoken ?? 0) * 10) / 10,
          minutesListened: Math.round((data.minutes_listened ?? 0) * 10) / 10,
          weeklyChange: { spoken: 0, listened: 0 },
        };
      }
    } catch {
      // Fall through to local
    }
  }

  const stats = await readLocal();
  return {
    minutesSpoken: Math.round(stats.minutesSpoken * 10) / 10,
    minutesListened: Math.round(stats.minutesListened * 10) / 10,
    weeklyChange: { spoken: 0, listened: 0 },
  };
}
