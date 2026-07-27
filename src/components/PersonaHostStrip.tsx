"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PERSONA_HOST_SCRIPTS, type PersonaHostScript } from "@/lib/persona-hosts";

/** Fixed slot height — stops page jump when hosts rotate (mobile column layout is tallest). */
const HOST_SLOT_CLASS = "h-[21rem] sm:h-[11.75rem]";

function HostCard({ host, className = "" }: { host: PersonaHostScript; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-cyan-950/20 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 h-full ${className}`}
    >
      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:w-24 shrink-0">
        <div
          className="w-16 h-16 rounded-2xl bg-black/50 border border-purple-500/40 flex items-center justify-center text-3xl shadow-lg shadow-purple-900/30"
          aria-hidden
        >
          {host.emoji}
        </div>
        <div className="text-center sm:text-left min-w-0">
          <p className="text-xs font-black text-purple-200 truncate">{host.displayName}</p>
          <p className="text-[9px] text-zinc-600 font-mono truncate">{host.personaId}</p>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 shrink-0">Persona host</p>
        <h3 className="text-lg font-black text-white leading-tight mt-2 shrink-0 line-clamp-2">{host.headline}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed mt-2 flex-1 min-h-0 overflow-y-auto pr-0.5">
          {host.body}
        </p>
        <div className="mt-2 h-5 shrink-0">
          {host.ctaHref && host.ctaLabel ? (
            host.ctaHref.startsWith("http") ? (
              <a
                href={host.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[11px] font-bold text-purple-300 hover:text-purple-200 truncate max-w-full"
              >
                {host.ctaLabel} →
              </a>
            ) : (
              <Link
                href={host.ctaHref}
                className="inline-block text-[11px] font-bold text-purple-300 hover:text-purple-200 truncate max-w-full"
              >
                {host.ctaLabel} →
              </Link>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Rotating scripted persona intros — Phase 2 transparency (no LLM spend). */
export function PersonaHostStrip({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % PERSONA_HOST_SCRIPTS.length);
  }, []);

  useEffect(() => {
    const t = setInterval(next, 14_000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className={`space-y-3 ${className}`} aria-label="AI persona hosts">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/80">Meet a host</p>
          <p className="text-xs text-zinc-500 mt-0.5">Scripted intros from our personas — not a live AI call.</p>
        </div>
        <div className="flex gap-1 items-center">
          {PERSONA_HOST_SCRIPTS.map((s, i) => (
            <button
              key={s.personaId}
              type="button"
              aria-label={`Show host ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? "bg-purple-400" : "bg-zinc-700 hover:bg-zinc-500"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={next}
            className="ml-2 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded border border-zinc-700"
          >
            Next
          </button>
        </div>
      </div>
      <div className={`relative ${HOST_SLOT_CLASS}`}>
        {PERSONA_HOST_SCRIPTS.map((h, i) => (
          <div
            key={h.personaId}
            className={`absolute inset-0 transition-opacity duration-300 ease-out ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={i !== index}
          >
            <HostCard host={h} />
          </div>
        ))}
      </div>
    </section>
  );
}
