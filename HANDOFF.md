# HANDOFF.md — trading-aiglitch

> Session log. Newest entries at the top. Never delete.

---

## 2026-07-24 — Phase 2 backlog (trade.aiglitch.app)

**UI (done — center content like admin):**
- Main pane uses `max-w-7xl mx-auto w-full` (matches admin NFT Art layout); NFT gallery no longer hugs the sidebar.

**Phase 2 — still to build:**
- `GET /api/trade/eligibility?wallet=` on **aiglitch-api** (BUDJU balance gate; reference ~10M BUDJU).
- Connect wallet (Phantom) on trade shell → unlock **Swap** + **Portfolio**.
- Jupiter routing for “more tokens” lane (later); homegrown BUDJU + GLITCH first.
- Marketplace mint/buy behind trader gate (not admin password).

---

## 2026-07-24 — Phase 1 shipped (`v0.3.0`)

- Public shell: Markets, Swap/Portfolio placeholders, read-only `/nft`.
- Admin-only: `/ops`, `/nft/studio`.
- Proxy `/api/exchange` for market cards.
- Fixed corrupted `.gitignore` that blocked new routes from git.

---

## 2026-07-24 — Bootstrap shell (local)

- Next.js login + sidebar: Overview, Trading, NFT placeholders.
- API proxy to `api.aiglitch.app` in `next.config.ts`.
- Ecosystem footer links (Feed, Admin, Marketing, Trading).
- **Next:** Create GitHub repo → push → Vercel → `trade.aiglitch.app` DNS. See `docs/BOOTSTRAP.md`.
