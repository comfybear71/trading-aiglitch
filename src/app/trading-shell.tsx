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
import { useTraderWallet } from "@/context/TraderWalletContext";
import { WalletConnectButton, WalletConnectModal } from "@/components/WalletConnectModal";
import { EcosystemFooter } from "@/components/EcosystemFooter";

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
  const [sidebarConnectOpen, setSidebarConnectOpen] = useState(false);
  const trader = useTraderWallet();

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

          {(opsUnlocked || trader.isAdminWallet) && (
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

        {(!trader.wallet || (opsUnlocked && !trader.isAdminWallet)) && (
        <div className="p-3 border-t border-zinc-800/80 space-y-2">
          {!trader.wallet ? (
            <>
              <button
                type="button"
                disabled={trader.loading}
                onClick={() => setSidebarConnectOpen(true)}
                className="w-full rounded-lg border border-cyan-500/40 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 px-3 py-2.5 text-sm font-medium text-cyan-100 hover:border-cyan-400/60 disabled:opacity-50"
              >
                {trader.loading ? "Connecting…" : "Connect wallet"}
              </button>
              <WalletConnectModal
                open={sidebarConnectOpen}
                onClose={() => setSidebarConnectOpen(false)}
                purpose="Connect to swap & portfolio"
              />
              {trader.error && (
                <p className="text-[10px] text-red-400 text-center">{trader.error}</p>
              )}
              <p className="text-[10px] text-zinc-600 text-center leading-snug">
                Hold ≥{(trader.eligibility?.budju_required ?? 1_000_000).toLocaleString()} $BUDJU on-chain to swap
              </p>
            </>
          ) : null}
          {opsUnlocked && !trader.isAdminWallet && (
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
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#0d0d14] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={homeHref} className="md:hidden font-bold text-purple-400 shrink-0">
              Trade
            </Link>
            <span className="text-xs text-zinc-500 capitalize truncate hidden sm:inline">
              {slug.replace(/-/g, " ")}
            </span>
          </div>
          <WalletConnectButton />
        </header>
        <main className="flex-1 overflow-auto min-w-0 w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:px-6">
          {children}
          <EcosystemFooter />
        </main>
      </div>
    </div>
  );
}
