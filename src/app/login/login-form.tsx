"use client";

import { useState } from "react";

function safeRedirectPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/ops";
  return next;
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const target = safeRedirectPath(redirectTo);

  const submit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (!res.ok) {
        setErr("Invalid password");
        setBusy(false);
        return;
      }
      window.location.href = target;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <>
      {err && <p className="text-red-400 text-sm text-center mb-4">{err}</p>}
      <input
        type="password"
        autoFocus
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="w-full px-4 py-3 mb-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
      />
      <button
        onClick={submit}
        disabled={busy || !password}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in to Ops"}
      </button>
      <p className="text-zinc-600 text-xs text-center mt-4">
        Public Markets &amp; NFT gallery do not require this login.
      </p>
    </>
  );
}
