"use client";

import { useCallback, useEffect, useState } from "react";
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
    const hadData = !!peekOtcConfigCache() || !!otc;
    if (!hadData) setLoading(true);
    else setRefreshing(true);
    try {
      const next = await fetchOtcConfig({ force });
      if (next) setOtc(next);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [otc]);

  useEffect(() => {
    const cached = peekOtcConfigCache();
    if (cached) {
      setOtc(cached);
      setLoading(false);
    }
    void refresh(true);
    if (pollMs <= 0) return;
    const id = window.setInterval(() => void refresh(true), pollMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + poll interval only
  }, [pollMs]);

  return { otc, loading, refreshing, refresh: () => refresh(true) };
}
