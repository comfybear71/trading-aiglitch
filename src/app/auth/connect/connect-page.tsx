"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Phone flow: /auth/connect?c={challengeId} — signs wallet-qr challenge for trade.aiglitch.app */
export default function TradeConnectPage() {
  const params = useSearchParams();
  const challengeId = params.get("c");

  const [status, setStatus] = useState<"loading" | "ready" | "signing" | "success" | "error">("loading");
  const [challengeMessage, setChallengeMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!challengeId) {
      setStatus("error");
      setError("No challenge ID provided");
      return;
    }

    fetch(`/api/auth/wallet-qr?c=${challengeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "expired") {
          setStatus("error");
          setError("Challenge expired — scan a fresh QR on your computer");
        } else if (data.status === "approved") {
          setStatus("success");
        } else if (data.message) {
          setChallengeMessage(data.message);
          setStatus("ready");
        } else {
          setStatus("error");
          setError("Challenge not found");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Failed to load challenge");
      });
  }, [challengeId]);

  const signWithPhantom = async () => {
    if (!challengeId || !challengeMessage) return;
    setStatus("signing");
    try {
      const phantom = (
        window as unknown as {
          solana?: {
            isPhantom: boolean;
            connect: () => Promise<{ publicKey: { toString: () => string } }>;
            signMessage: (msg: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
          };
        }
      ).solana;

      if (!phantom?.isPhantom) {
        window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`;
        return;
      }

      const resp = await phantom.connect();
      const publicKey = resp.publicKey.toString();
      const messageBytes = new TextEncoder().encode(challengeMessage);
      const signResult = await phantom.signMessage(messageBytes, "utf8");
      const signatureBase64 = btoa(String.fromCharCode(...signResult.signature));

      const submitRes = await fetch("/api/auth/wallet-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, signature: signatureBase64, publicKey }),
      });
      const submitData = await submitRes.json();

      if (submitData.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(submitData.error || "Verification failed");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-cyan-500/25 rounded-2xl p-6 max-w-sm w-full text-center">
        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          AIG!itch Trade
        </h1>
        <p className="text-zinc-500 text-xs mb-6">Sign with Phantom to connect this device</p>

        {status === "loading" && <p className="text-zinc-500 animate-pulse text-sm">Loading…</p>}
        {status === "ready" && (
          <button
            type="button"
            onClick={signWithPhantom}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl"
          >
            Connect Phantom
          </button>
        )}
        {status === "signing" && (
          <p className="text-purple-300 text-sm animate-pulse">Waiting for Phantom…</p>
        )}
        {status === "success" && (
          <p className="text-green-400 font-bold text-sm">Connected — you can close this page.</p>
        )}
        {status === "error" && (
          <>
            <p className="text-red-400 text-sm">{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="text-cyan-400 text-xs underline mt-3">
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
