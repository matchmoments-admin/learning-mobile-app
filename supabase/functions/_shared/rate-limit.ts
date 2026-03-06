import { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const DAILY_LIMIT = 50;

/**
 * Check and increment rate limit for a user on a given endpoint.
 * Uses the service-role client so RLS is bypassed.
 * Returns { allowed: true } or { allowed: false, remaining: 0 }.
 */
export async function checkRateLimit(
  adminClient: SupabaseClient,
  userId: string,
  endpoint: string,
): Promise<{ allowed: boolean }> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Upsert: increment if row exists, insert with count=1 otherwise
  const { data, error } = await adminClient.rpc("increment_rate_limit", {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_window_start: today,
    p_limit: DAILY_LIMIT,
  });

  // If the RPC doesn't exist yet, fall back to a simple query approach
  if (error) {
    // Fallback: read then write
    const { data: existing } = await adminClient
      .from("rate_limits")
      .select("call_count")
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .eq("window_start", today)
      .maybeSingle();

    const currentCount = existing?.call_count ?? 0;

    if (currentCount >= DAILY_LIMIT) {
      return { allowed: false };
    }

    await adminClient.from("rate_limits").upsert(
      {
        user_id: userId,
        endpoint,
        window_start: today,
        call_count: currentCount + 1,
      },
      { onConflict: "user_id,endpoint,window_start" },
    );

    return { allowed: true };
  }

  return { allowed: !!data };
}
