# HANDOFF.md — trading-aiglitch

> Session log. Newest entries at the top. Never delete.

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
