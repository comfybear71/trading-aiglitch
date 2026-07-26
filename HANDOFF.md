# HANDOFF.md — trading-aiglitch

> Session log. Newest entries at the top. Never delete.

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
