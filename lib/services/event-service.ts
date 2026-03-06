import { supabase } from "@/utils/supabase";

/**
 * Logs a learning event to the learning_events table.
 * Used for grant-required analytics and accommodation tracking.
 */
export async function logLearningEvent(
  userId: string,
  eventType: string,
  eventData: Record<string, unknown> = {},
): Promise<void> {
  try {
    await supabase.from("learning_events").insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
    });
  } catch (err) {
    // Fire-and-forget — don't block the learning flow
    console.error("Failed to log learning event:", err);
  }
}

// Common event types
export const EVENTS = {
  LESSON_STARTED: "lesson_started",
  LESSON_COMPLETED: "lesson_completed",
  QUESTION_ANSWERED: "question_answered",
  CONVERSATION_STARTED: "conversation_started",
  CONVERSATION_TURN: "conversation_turn",
  CONVERSATION_COMPLETED: "conversation_completed",
  VOCABULARY_REVIEWED: "vocabulary_reviewed",
  PACK_ENROLLED: "pack_enrolled",
  ONBOARDING_COMPLETED: "onboarding_completed",
} as const;
