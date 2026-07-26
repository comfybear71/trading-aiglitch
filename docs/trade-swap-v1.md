# trade.aiglitch.app — Swap v1 scope

Locked **2026-07-26** after mainnet market swaps shipped.

## In scope (v1 — live)

| Feature | Backend | UI |
|---------|---------|-----|
| **Market swap** | `GET /api/trade/jupiter/quote`, `POST /api/trade/jupiter/swap`, `POST /api/trade/submit` | Sell/Buy, slippage, quote review, route modal, activity |
| **BUDJU gate** | `GET /api/trade/eligibility`, 403 on swap build | Locked state + required balance copy |
| **Tokens** | Jupiter: SOL, USDC, BUDJU only | §GLITCH → [aiglitch.app/exchange](https://aiglitch.app/exchange) OTC |
| **History** | `POST/GET /api/trade/activity` | Swap history panel + Portfolio activity |

Deep links: `/swap?sell=USDC&buy=SOL` (optional query params).

## Out of scope (v2 — not fake-enabled)

| Feature | Why deferred |
|---------|----------------|
| **Limit orders** | Jupiter Limit uses trigger/vault flow + order persistence (not our quote/swap POST). Needs dedicated API integration and open-order UI. |
| **Recurring / DCA** | Jupiter Smart DCA requires one-time vault setup, scheduler, and cancel/manage surfaces. No cron in trading-aiglitch. |

**v1 UX:** Limit & Recurring tabs show a single **coming soon** card with link to [jup.ag](https://jup.ag/swap) for advanced order types. No disabled “Create DCA” that looks submit-ready.

## v2 build checklist (when prioritised)

1. **API (aiglitch-api):** proxy Jupiter Trigger / Recurring APIs (or documented alternative), store orders in Postgres, auth by wallet.
2. **Trade UI:** vault signature step, open orders list, cancel.
3. **Ops:** rate limits, cost ledger if keeper/cron needed.

Until then, market swap is the supported product on trade.aiglitch.app.

## Phantom / Blowfish warnings (new domain)

Users may see **“This dApp could be malicious”** or **“This domain is new”** when signing swaps. That is Blowfish simulation + domain age, not necessarily a bug in our tx.

**User flow:** Proceed anyway → Confirm (unsafe) → check **I understand…** → **Yes, confirm (unsafe)** at the bottom. Closing **Are you sure?** leaves no transaction (app shows a Phantom-blocked toast).

**Dev:** We prefer `signAndSendTransaction` in Phantom before fallback sign + `/api/trade/submit`. Request domain review: [Phantom form](https://docs.google.com/forms/d/1JgIxdmolgh_80xMfQKBKx9-QPC7LRdN6LHpFFW8BlKM/viewform) or Blowfish `review@blowfish.xyz`.
