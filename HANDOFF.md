# HANDOFF.md — trading-aiglitch

> Session log. Newest entries at the top. Never delete.

---

## 2026-07-24 — Phase 2 shipped (pending merge)

**Requires aiglitch-api PR first** (`/api/trade/*` on api.aiglitch.app + `JUPITER_API_KEY` + `HELIUS_API_KEY`).

- Phantom connect in sidebar · `GET /api/trade/eligibility?wallet=` (proxied)
- Swap: Jupiter quote/swap build for SOL · USDC · BUDJU · GLITCH (BUDJU gate on swap build)
- Portfolio: on-chain balances for connected wallet (read-only without gate)
- Env override: `TRADE_BUDJU_MIN_BALANCE` on API (default 10M)

**Still later:** marketplace mint behind gate, “More via Jupiter” token picker, QR swap for iPad.

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
