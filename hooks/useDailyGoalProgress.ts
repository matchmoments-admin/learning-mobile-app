import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/ctx/AuthContext";
import { getDailyGoalProgress } from "@/lib/services/daily-goal-service";
import { DailyGoalProgress } from "@/lib/types/daily-goal";

export function useDailyGoalProgress() {
  const { user } = useAuth();
  const [goalProgress, setGoalProgress] = useState<DailyGoalProgress | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const progress = await getDailyGoalProgress(user?.id);
      setGoalProgress(progress);
    } catch {
      // Keep existing state
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { goalProgress, loading, refresh };
}
