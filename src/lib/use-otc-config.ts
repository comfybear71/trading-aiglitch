"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchOtcConfig, peekOtcConfigCache, type OtcPublicConfig } from "@/lib/glitch-otc";

export function useOtcConfig(pollMs = 0) {
  const [otc, setOtc] = useState<OtcPublicConfig | null>(() =>
    typeof window !== "undefined" ? peekOtcConfigCache() : null,
  );
  const [loading, setLoading] = useState(() =>
    typeof window !== "undefined" ? !peekOtcConfigCache() : true,
  );
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async (force = true) => {
    const hadData = !!peekOtcConfigCache();
    if (!hadData) setLoading(true);
    else setRefreshing(true);
    try {
      const next = await fetchOtcConfig({ force });
      if (next) setOtc(next);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    const cached = peekOtcConfigCache();
    if (cached) {
      setOtc(cached);
      setLoading(false);
    }
    void refreshRef.current(true);
    if (pollMs <= 0) return;
    const id = window.setInterval(() => void refreshRef.current(true), pollMs);
    return () => window.clearInterval(id);
  }, [pollMs]);

  const refreshStable = useCallback(() => refreshRef.current(true), []);

  return { otc, loading, refreshing, refresh: refreshStable };
}
