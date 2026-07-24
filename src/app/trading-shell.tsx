"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_SLUG,
  NAV_SECTIONS,
  OPS_NAV,
  slugFromPathname,
} from "./nav";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-purple-500/20 text-purple-200 font-medium"
          : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
      }`}
    >
      {label}
    </Link>
  );
}

export function TradingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = slugFromPathname(pathname);
  const [opsUnlocked, setOpsUnlocked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/admin", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setOpsUnlocked(!!d.authenticated))
      .catch(() => setOpsUnlocked(false));
  }, [pathname]);

  const isLogin = pathname === "/login" || pathname.startsWith("/auth/");

  if (isLogin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">{children}</div>
    );
  }

  const homeHref = `/${DEFAULT_SLUG}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex flex-col md:flex-row">
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-[#0d0d14]">
        <div className="p-4 border-b border-zinc-800/80">
          <Link href={homeHref} className="block group">
            <span className="text-lg font-bold tracking-tight">
              <span className="text-purple-400">AIG!</span>
              <span className="text-cyan-400">itch</span>
              <span className="text-zinc-500 font-normal text-sm ml-1">
                Trade
              </span>
            </span>
          </Link>
          <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">
            Decentralized · Persona markets
          </p>
        </div>

        <nav className="p-3 space-y-5 max-h-[70vh] md:max-h-none overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.slug}
                    href={`/${item.slug}`}
                    label={item.label}
                    active={slug === item.slug}
                  />
                ))}
              </div>
            </div>
          ))}

          {opsUnlocked && (
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-700/80">
                Ops
              </p>
              <NavLink
                href={`/${OPS_NAV.slug}`}
                label={OPS_NAV.label}
                active={slug === OPS_NAV.slug}
              />
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-zinc-800/80 space-y-2">
          <button
            type="button"
            disabled
            title="Phase 2: BUDJU balance gate + Phantom"
            className="w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 text-sm font-medium text-cyan-200/90 cursor-not-allowed opacity-80"
          >
            Connect wallet
          </button>
          <p className="text-[10px] text-zinc-600 text-center leading-snug">
            Trader access: hold enough $BUDJU on-chain (Phase 2)
          </p>
          {!opsUnlocked ? (
            <Link
              href="/login?next=/ops"
              className="block text-center text-xs text-zinc-500 hover:text-purple-400 transition-colors"
            >
              Admin sign-in → Ops
            </Link>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/admin", {
                  method: "DELETE",
                  credentials: "include",
                });
                setOpsUnlocked(false);
                window.location.href = "/markets";
              }}
              className="w-full text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Sign out admin
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#0d0d14]">
          <Link href={homeHref} className="font-bold text-purple-400">
            Trade
          </Link>
          <span className="text-xs text-zinc-500 capitalize">
            {slug.replace(/-/g, " ")}
          </span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}
