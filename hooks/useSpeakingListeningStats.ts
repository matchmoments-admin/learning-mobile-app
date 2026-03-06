import { useAuth } from "@/ctx/AuthContext";
import { getWeeklyStats } from "@/lib/services/stats-service";
import { useEffect, useState } from "react";

interface WeeklyStats {
  minutesSpoken: number;
  minutesListened: number;
  weeklyChange: {
    spoken: number;
    listened: number;
  };
}

export const useSpeakingListningStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const weeklyStats = await getWeeklyStats(user?.id);
      setStats(weeklyStats);
    } catch (err) {
      console.error("Failed to load speaking/listning stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { stats, loading, refresh };
};
