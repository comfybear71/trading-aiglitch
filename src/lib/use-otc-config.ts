"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOtcConfig, type OtcPublicConfig } from "@/lib/glitch-otc";

export function useOtcConfig(pollMs = 0) {
  const [otc, setOtc] = useState<OtcPublicConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setOtc(await fetchOtcConfig());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (pollMs <= 0) return;
    const id = window.setInterval(() => void refresh(), pollMs);
    return () => window.clearInterval(id);
  }, [refresh, pollMs]);

  return { otc, loading, refresh };
}
