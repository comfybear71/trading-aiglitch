# trading-aiglitch — bootstrap from zero

Use this checklist when **comfybear71/trading-aiglitch** does not exist on GitHub or Vercel yet.

## Target architecture

| Piece | Value |
|-------|--------|
| Repo | `comfybear71/trading-aiglitch` |
| Domain | `trading.aiglitch.app` |
| Backend | `https://api.aiglitch.app` (strangler proxy, same as admin/marketing) |
| Auth | `POST /api/auth/admin` → cookie scoped to `.aiglitch.app` |
| First tabs | Login shell → **Trading** (from admin `/trading`) → **NFT Art** (from admin `/nft-marketplace`) |

Trading + on-chain endpoints stay on **aiglitch-api** until explicitly migrated (aiglitch-api CLAUDE decision #6).

## Step 1 — GitHub repo

1. GitHub → **New repository** → name `trading-aiglitch`, public (match sister repos).
2. **Description (copy-paste):**  
   `Next.js UI for trading.aiglitch.app — BUDJU/GLITCH trading, persona wallets, NFT tools. Proxies to api.aiglitch.app. Sister to admin-aiglitch & marketing-aiglitch.`
3. Do **not** add README/license on GitHub (this folder already has them).
4. Push from your PC:

```powershell
cd C:\Users\Stuie\Dev\github.com\comfybear71\trading-aiglitch
git init
git add .
git commit -m "Bootstrap trading-aiglitch shell (login + sidebar + API proxy)."
git branch -M master
git remote add origin https://github.com/comfybear71/trading-aiglitch.git
git push -u origin master
```

## Step 2 — Vercel project

1. Vercel → **Add New Project** → import `comfybear71/trading-aiglitch`.
2. Framework: **Next.js** (auto-detected).
3. **Environment variables** (Production + Preview):

| Name | Value |
|------|--------|
| `API_PROXY_TARGET` | `https://api.aiglitch.app` (optional; default in next.config) |

4. Deploy once on `master`.

## Step 3 — Custom domain

1. Vercel → **Settings → Domains** → add `trading.aiglitch.app`.
2. DNS: CNAME `trading` → Vercel’s target (shown in UI).
3. Open `https://trading.aiglitch.app/login` (same admin password as other apps).

## Step 4 — Admin redirects

Already planned in **admin-aiglitch** `next.config.ts`: `/trading` and `/nft-marketplace` → this app.

## Step 5 — First real feature PR

1. Port `admin-aiglitch/src/app/trading/*` into `src/app/trading/`.
2. Port `admin-aiglitch/src/app/nft-marketplace/` into `src/app/nft/`.
3. Remove **NFT Art** from admin sidebar when parity verified.

## Local dev

```powershell
cd C:\Users\Stuie\Dev\github.com\comfybear71\trading-aiglitch
npm install
npm run dev
```
