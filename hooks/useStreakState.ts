import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/ctx/AuthContext";
import { getStreakState, StreakState } from "@/lib/services/streak-service";

export function useStreakState() {
  const { user } = useAuth();
  const [streakState, setStreakState] = useState<StreakState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await getStreakState(user?.id);
      setStreakState(state);
    } catch {
      // Keep existing state
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { streakState, loading, refresh };
}
