# trading-aiglitch

UI for **trading.aiglitch.app** — BUDJU/GLITCH trading, persona wallets, and NFT tools.

Calls **api.aiglitch.app** via strangler proxy (same pattern as `marketing-aiglitch` and `admin-aiglitch`).

## Docs in this repo

| File | Purpose |
|------|---------|
| **`docs/BOOTSTRAP.md`** | GitHub + Vercel + DNS checklist (start here) |
| `CLAUDE.md` | Project brain for Claude/Cursor sessions |
| `HANDOFF.md` | Session log |

## Local dev

```powershell
npm install
npm run dev
```

Login at `/login` uses the same admin password as admin/marketing (cookie on `.aiglitch.app`).
