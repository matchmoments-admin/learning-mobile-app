import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";

const MIGRATED_FLAG = "data_migrated_to_supabase";

/**
 * On app update, reads existing AsyncStorage data and uploads to Supabase.
 * Sets a flag to avoid re-running on subsequent launches.
 */
export async function migrateLocalDataToSupabase(
  userId: string,
): Promise<void> {
  try {
    const alreadyMigrated = await AsyncStorage.getItem(MIGRATED_FLAG);
    if (alreadyMigrated === "true") return;

    // Migrate lesson progress
    const progressRaw = await AsyncStorage.getItem("lesson_progress");
    if (progressRaw) {
      const progress = JSON.parse(progressRaw) as Record<string, number>;
      const rows = Object.entries(progress).map(([lessonId, count]) => ({
        user_id: userId,
        lesson_id: lessonId,
        completion_count: count,
        last_completed_at: new Date().toISOString(),
      }));

      if (rows.length > 0) {
        await supabase
          .from("lesson_progress")
          .upsert(rows, { onConflict: "user_id,lesson_id" });
      }
    }

    // Migrate speaking/listening stats
    const statsRaw = await AsyncStorage.getItem("speaking_listening_stats");
    if (statsRaw) {
      const stats = JSON.parse(statsRaw);
      await supabase.from("user_stats").upsert(
        {
          user_id: userId,
          minutes_spoken: stats.minutesSpoken ?? 0,
          minutes_listened: stats.minutesListened ?? 0,
          questions_answered: stats.questionsAnswered ?? 0,
          questions_listened: stats.questionsListened ?? 0,
          conversation_turns: stats.conversationTurns ?? 0,
          last_activity_at: new Date().toISOString(),
        },
        { onConflict: "user_id,COALESCE(pack_id, '__global__')" },
      );
    }

    await AsyncStorage.setItem(MIGRATED_FLAG, "true");
    console.log("Local data migration to Supabase complete");
  } catch (err) {
    console.error("Failed to migrate local data:", err);
    // Don't set flag — will retry on next launch
  }
}
