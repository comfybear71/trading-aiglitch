# HANDOFF.md — trading-aiglitch

> Session log. Newest entries at the top. Never delete.

---

## 2026-07-27 — Roadmap: Jupiter Earn (Phase 6) + Perps high-risk (Phase 7)

**Branch:** `claude/trade-roadmap-jupiter-perps` — `/roadmap` UI + `docs/ecosystem-transparency-roadmap.md`. Tone aligned with $BUDJU: entertainment + DeFi, NFA, liquidation risk.

**Open:** Merge **aiglitch-api** `claude/trade-prices-jup-ray-fallback` if JUP/RAY still blank on Markets.

---

## 2026-07-27 — Markets Jupiter majors + §GLITCH SOL-only clarity

**Branch:** `claude/trade-markets-jupiter-curated` — merge **after** aiglitch-api same branch deploy.

**Includes:** Jupiter curated grid (7 tokens + SOL/USDC row); §GLITCH cards = reference prices, **Buy with SOL**; LST yield badges; swap picker extended. Send stays core tokens only.

---

## 2026-07-27 — B3 server net-worth history (two PRs — API first)

**Order:** Merge **aiglitch-api** `claude/trade-networth-snapshots` → deploy api → then **trading-aiglitch** `claude/trade-portfolio-networth-api`.

**User verified:** v0.4.32 polish (drawer filters, roadmap links). BUDJU gate: ~72k on test wallet — need 1M for full swap unlock (expected).

---

## 2026-07-27 — Phases 1–5 complete; polish wave B (in progress)

**Shipped (user confirmed):** Hatchery grid (**aiglitch** #329), Phase 5 (**trading-aiglitch** v0.4.31). Tags/housekeeping done by user.

**B — small polish (order):** (1) wallet drawer activity filters ✓ branch `claude/trade-wallet-drawer-activity`; (2) roadmap links Markets/home/drawer; (3) server net-worth history = **aiglitch-api** later.

**Last product item:** Trading AI personas + optional `trade.aiglitch.app/hatch` — see `docs/persona-ownership-roadmap.md`.

---

## 2026-07-27 — Phase 5 PnL sparkline + Send magic UX (merged v0.4.31)

**Shipped:** Portfolio allocation bar + legend; Activity tab filters (All/Swaps/Sends/Magic), kind badges, relative time, refresh. Roadmap Phase 4 marked done; **Trading AI personas** explicitly **last** on roadmap.

**Next:** Remaining trade polish (PnL chart later per HANDOFF); then **persona trading** when update wave complete.

---

## 2026-07-27 — Phase 3 platform CTAs + persona trading **deferred** (merged, v0.4.29)

**Shipped:** Trade home **Use the platform** strip → aiglitch.app feed/channels/hatchery + `/nft`. Roadmap UI marks **Trading AI personas** as **Deferred — revisit after current update wave**. Docs updated: `persona-ownership-roadmap.md`, `ecosystem-transparency-roadmap.md`.

**Parked (user confirmed):** Auction / tradable seed personas / secondary market — **no API work** until end of trade + aiglitch updates. PR #40 (Phase 2) merged on master.

**Next backlog (when user says go):** Portfolio v2 polish, Activity UX, optional `/roadmap` link in footer; then **persona ownership P2–P5** pass coordinated with aiglitch-api.

---

## 2026-07-27 — Phase 2 persona hosts + persona ownership roadmap (merged #40)

**Shipped (trade UI):** `PersonaHostStrip` on Markets + About; `/roadmap` with trade phases + **persona ownership** section (auction/resell vision — not built on-chain yet).

**Product doc:** `docs/persona-ownership-roadmap.md` — hatch today (`owner_wallet_address`); seed persona auctions = P3+.

---

**User intent:** trade.aiglitch.app must explain **why §GLITCH and $BUDJU exist**, how **AIG!itch makes money** (in-house + sponsor **product placement** on aiglitch.app, marketplace, OTC treasury), and show **roadmap + all socials** — invite **platform use**, not memecoin speculation. **$BUDJU:** burn + treasury/yield (“bank”, Jupiter interest-bearing) — link budju.xyz tokenomics; don’t over-promise APY in UI until spec pinned. **Later:** AI **persona hosts** on Markets/About to narrate the ecosystem.

**Canonical doc:** `docs/ecosystem-transparency-roadmap.md` (social URLs, revenue table, UI phases). Extend `GlitchExchangeStory` + new footer/`ecosystem-links.ts` when user says go.

**In progress (local):** OTC config cache, compact §GLITCH promo, Markets BUDJU|GLITCH 2-col — tag **`v0.4.16`** when merged.

---

## 2026-07-26 — §GLITCH exchange on trade.aiglitch.app (in PR)

**Branch:** `claude/trade-exchange-home` — `/exchange` buy flow (OTC + Phantom), sidebar **Buy §GLITCH**, fundraise hero (includes prior invest-promo work). Canonical URL: `https://trade.aiglitch.app/exchange`. **aiglitch** PR: `/exchange` → redirect to trade.

---

## 2026-07-26 — §GLITCH OTC (merged #18, v0.4.6)

## 2026-07-26 — Markets v2 (merged #17)

Price cards, refresh, swap deep links.

---

## 2026-07-26 — DB wallet activity + Portfolio pass

**Ship order:** Merge **aiglitch-api** `claude/trade-wallet-activity-db` first → deploy api.aiglitch.app → then merge **trading-aiglitch** `claude/send-activity-magic-link` (or follow-up PR).

**API:** `trade_wallet_activity` table; `GET/POST /api/trade/activity`; magic events logged on confirm/refund/claim PUT; `GET /api/trade/magic-link/sent`; `POST …/abandon` for unfunded links.

**UI:** No localStorage for send/swap history. `TradeActivityPanel` + `MagicLinkOpenLinks` on Send, Portfolio Activity tab, wallet drawer Activity. Portfolio positions: allocation %, recent activity teaser, Trade link per row.

**Verify:** Transfer + swap → activity rows; magic deposit/refund/claim → rows; dismiss unfunded / cancel & refund; Portfolio + drawer Activity match.

**Later:** PnL history chart; backfill old magic links from `trade_magic_claims`; eToro CFD monitor (post trade-app complete).

---

## 2026-07-26 — Swap v1 scope (Limit/Recurring deferred)

**Decision:** Market swap only on trade.aiglitch.app for v1. Limit + Recurring need Jupiter vault/trigger APIs + order DB — see `docs/trade-swap-v1.md`.

**UI:** Limit/Recurring tabs show honest “Coming soon” + jup.ag link (removed fake DCA form). `/swap?sell=USDC&buy=SOL` deep links from Portfolio.

---

Mobile Safari and in-app browsers have no `window.solana`. Use **Open in Phantom app** (`phantom.app/ul/browse/…`) — same as aiglitch.app. Claim page + Connect modal; QR login hidden on phone (iPad/PC only).

**Magic link deploy SOL:** See aiglitch-api `docs/trade-magic-link-mainnet-ops.md` (~1.7 SOL locked as program rent on `4C8fFR…`; wallet `4Jm25…` shows liquid ~1.37 SOL).

---

## 2026-07-25 — Send activity + mainnet cutover

**Activity fix (local):** Magic Link deposits/refunds now append to the same localStorage history as Transfer; Activity panel shows under both Send modes with devnet-aware Solscan links.

**Your 2.5 USDC:** Magic Link (not Transfer) — past sends won’t backfill; new magic links will appear after this ships.

### Switch trade + API back to **mainnet** (Vercel — you)

| Project | Variable | Production value |
|---------|----------|------------------|
| **aiglitch-api** | `NEXT_PUBLIC_SOLANA_NETWORK` | `mainnet-beta` (or **delete** the var — default is mainnet) |
| **aiglitch-api** | `TRADE_MAGIC_CLAIM_PROGRAM_ID` | **Remove** devnet program id `3m1zLK…` (wrong cluster on mainnet) |
| **aiglitch-api** | `TRADE_MAGIC_LINK_ENABLED` | leave **unset** / `false` until mainnet program deploy |
| **trading-aiglitch** | `NEXT_PUBLIC_SOLANA_NETWORK` | `mainnet-beta` or **delete** |

**Phantom:** Settings → Developer → **Testnet Mode OFF**.

**What works on mainnet immediately:** swap, transfer, portfolio balances (Helius), real USDC mint.

**Magic Link:** stays **off** on mainnet until you deploy the escrow program to mainnet, set the new program id on API, then `TRADE_MAGIC_LINK_ENABLED=true`. Devnet smoke test program id must not stay in production env.

Redeploy **both** projects after env changes.

---

## 2026-07-24 — Send/Receive + swap parity (committed, merge after API)

**API dependency:** `POST /api/trade/transfer`, `GET /api/trade/prices`, quote `fees` payload.

| Feature | Status |
|---------|--------|
| `/send` Send/Receive (Transfer, QR deposit) | Done |
| Holdings chips SOL/USDC/BUDJU/GLITCH | Portfolio + Connect drawer |
| Swap JupShield warnings, routing modal, chart/history toggles | Done |
| Limit tab stub · Recurring DCA shell + settings modal | UI only |

Merge **aiglitch-api** branch first, deploy api.aiglitch.app, then merge this repo.

---

## 2026-07-24 — Jupiter-inspired UX (reference + partial build)

**Reference:** jup.ag Connect drawer, wallet sidebar, Portfolio page (Phantom-connected).

| Jupiter pattern | Our plan / status |
|-----------------|-------------------|
| **Connect** right drawer, blurred backdrop, Phantom + QR | **Done (local):** `WalletConnectModal` slide-over; Phantom + QR |
| **Toast** on connect (bottom corner) | **Done (local):** `WalletConnectToasts` bottom-right; skips reload restore |
| **Connected wallet** right panel: address, holdings list, Wallet/Activity tabs | **Partial:** header chip opens drawer; Activity tab placeholder |
| **Portfolio page:** net worth USD, PnL, history chart, positions table, Send/Deposit | **Later:** `/portfolio` is balance cards today — upgrade in dedicated pass |
| Multi-wallet picker (Installed / Recently used) | **Later:** Phantom only + QR v1; Solflare/Backpack per ROADMAP session 18 |
| **Swap page (jup.ag/swap):** Market/Limit/Recurring tabs, Sell/Buy rows, balance + HALF/MAX, chart/history, token cards w/ price | **Partial (local):** Market tab; Sell/Buy; HALF/MAX; pre-swap review (rate, fees, route); slippage 0.5/1/2%; swap toasts + Solscan; `/api/trade/prices` for USD hints |
| **Portfolio (jup.ag/portfolio):** net worth, positions table, activity | **Partial (local):** est. USD net worth, holdings table, Positions tab; Activity later |
| **Toasts** connect + swap | **Done (local):** `TradeToastProvider` bottom-right |

Keep AIG!itch purple/cyan — do not clone Jupiter green branding.

---

## 2026-07-24 — Phase 2 shipped (pending merge)

**Requires aiglitch-api PR first** (`/api/trade/*` on api.aiglitch.app + `JUPITER_API_KEY` + `HELIUS_API_KEY`).

- Phantom connect in sidebar · `GET /api/trade/eligibility?wallet=` (proxied)
- Swap: Jupiter quote/swap build for SOL · USDC · BUDJU · GLITCH (BUDJU gate on swap build)
- Portfolio: on-chain balances for connected wallet (read-only without gate)
- Env override: `TRADE_BUDJU_MIN_BALANCE` on API (default **1M**)

**Still later:** marketplace mint behind gate, Limit/Recurring swap, chart/history panel, swap activity feed.

**API (same release):** `GET /api/trade/prices` — Jupiter USD for SOL/BUDJU/USDC/GLITCH (needs deploy with quote routes).

---

## 2026-07-24 — Phase 2 backlog (partial)

**UI (done — center content like admin):** `max-w-7xl mx-auto w-full`

---

## 2026-07-24 — Phase 1 shipped (`v0.3.0` / `v0.3.1`)

- Public shell: Markets, Swap/Portfolio placeholders, read-only `/nft`.
- Admin-only: `/ops`, `/nft/studio`.
- Proxy `/api/exchange` for market cards.

---

## 2026-07-24 — Bootstrap shell (local)

- Next.js login + sidebar; API proxy to `api.aiglitch.app`.
