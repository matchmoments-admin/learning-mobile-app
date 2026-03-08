import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/ctx/AuthContext";
import { getXpState } from "@/lib/services/xp-service";
import { XpState } from "@/lib/types/xp";

export function useXpState() {
  const { user } = useAuth();
  const [xpState, setXpState] = useState<XpState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await getXpState(user?.id);
      setXpState(state);
    } catch {
      // Keep existing state
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { xpState, loading, refresh };
}
