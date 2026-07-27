# Ecosystem transparency & monetization — trade.aiglitch.app

> **Owner intent (2026-07-26):** Investors and traders need to see **utility**, **honest revenue**, and **roadmap** — not memecoin vibes. This doc is the source of truth for future UI on trade (persona hosts, `/glitch` story, Markets footer, dedicated About/Roadmap). Update as product ships.

---

## Positioning (what we tell people)

- **AIG!itch** is an AI-native social product: 100+ personas, channels, marketplace, mobile Bestie, and **trade.aiglitch.app** for real on-chain trading.
- **§GLITCH** is in-app / community-round currency with **on-chain OTC** today and **DEX listing after treasury goal** — not a “dog coin”; tied to a live platform people can use today on [aiglitch.app](https://aiglitch.app).
- **$BUDJU** is the **trader access + ecosystem token** (swap gate, persona trading lore, **burn** and **treasury/yield design** — details on [budju.xyz](https://www.budju.xyz/tokenomics)). Position as **serious DeFi + entertainment**, not hype-only.

Tone on trade UI: **transparent, futuristic, fun** — invite people to **use** the platform (feed, channels, marketplace, app), not only buy tokens.

---

## How the **platform** (aiglitch.app) makes money today / near-term

These flows live in **aiglitch-api** / legacy aiglitch; trade site should **explain and link**, not duplicate backend logic.

| Stream | What it is | Why it matters for token holders |
|--------|------------|----------------------------------|
| **Branded product placement (Tier 2)** | Sponsors pay for campaigns; visuals/text injected into AI video, posts, channels (`ad_campaigns`, frequency-based placement). MasterHQ + in-house sponsors. | Real **advertising revenue** tied to content reach; sponsor campaigns can **burn §GLITCH** (non–in-house). Platform grows → more impressions → more sponsor value. |
| **Platform promo ads (Tier 1)** | Cron-generated ecosystem promo videos; spreads to socials. | Marketing for the product; supports user growth (indirect value to GLITCH/BUDJU utility). |
| **Marketplace & NFTs** | §GLITCH purchases; on-chain NFT mints; revenue split (treasury / persona). | **Direct §GLITCH demand** — hatch personas, buy goods, collect NFTs. |
| **Sponsor / GLITCH economy** | Sponsors hold §GLITCH balances; daily burn on active campaigns; in-house promos at configurable frequency. | Links ad sales to **token sink** and campaign lifecycle. |
| **Community round (OTC)** | SOL → treasury wallet; bonding curve (+$0.01 / 10k sold). | **Capital raise for listing, liquidity, ops** — already shown on `/glitch` with verifiable on-chain treasury. |

**Future (document when live):** trading fees on Jupiter routes, persona-bot treasury ops (`/ops`), paid sponsor tiers on MasterHQ, app/IAP if any.

---

## §GLITCH — utility (why hold / buy)

Already partially on `/glitch` via `GlitchExchangeStory.tsx`. Expand over time:

1. **Spend on aiglitch.app** — marketplace, hatchery (~1k §GLITCH), tips/donations, NFTs, in-app GLITCH economy.
2. **Community round** — early curve; treasury progress toward **5,000 SOL** goal; Raydium/Jupiter listing **after** goal (not before).
3. **Ecosystem alignment** — AI personas with wallets; content + trading narrative (volume story is **product-led**, not pure speculation).
4. **Revenue alignment (transparent)** — platform ad and marketplace activity **drive the business**; OTC treasury funds **infrastructure and listing**, not anonymous team dumps.

**Trade UI backlog:** “How AIG!itch earns” accordion on `/glitch`; link to public sponsor page `/sponsor` on aiglitch.app when appropriate.

---

## $BUDJU — utility (why hold / use)

Document with links to official BUDJU materials; verify numbers on-chain before hard-coding APY.

1. **Trade gate** — 1M $BUDJU on connected wallet unlocks full swap set on trade.aiglitch.app (SOL/USDC/BUDJU paths for sub-gate).
2. **Burn mechanism** — when protocol/treasury economics generate surplus, **burn** reduces supply (spell out exact trigger in tokenomics doc — do not over-promise in UI until spec is pinned).
3. **Treasury / “bank”** — Jupiter **interest-bearing** or yield-bearing positions (user-facing: “BUDJU bank” on budju.xyz); trade site = **short summary + link** to [How to buy](https://www.budju.xyz/trade) and [Tokenomics](https://www.budju.xyz/tokenomics).
4. **Persona trading** — 100+ AI wallets / BUDJU bot narrative (ops on `/ops` for admin); public copy = “persona markets” without implying guaranteed returns.

**Trade UI backlog:** BUDJU card on Markets already points to budju.xyz — add one line on **burn + treasury/yield** when copy is approved.

---

## trade.aiglitch.app — UX roadmap (this repo)

| Phase | Feature | Notes |
|-------|---------|--------|
| **Now** | OTC stats, treasury verify link, BUDJU gate, Markets BUDJU \| §GLITCH header | Shipped. |
| **Done (2026-07-27)** | **Social strip + footer** — `ecosystem-links.ts` + `EcosystemFooter` | Telegram + all socials. |
| **Done (2026-07-27)** | **Business model** accordion on `/glitch`, **`/about`**, Markets links | `AiglitchBusinessModel`, `AboutClient`. |
| **Done (2026-07-27)** | **BUDJU burn/treasury** one-liner on Markets | `BudjuMarketsPromo` → tokenomics link. |
| **Later** | **AI persona hosts** on Markets or `/about` | Rotating persona clip/avatar + short scripted intro (“What is AIG!itch?”, “Why §GLITCH?”, “Why $BUDJU?”) — content from API or static persona IDs; **not** live LLM on first version unless cost-bounded. |
| **Later** | Dedicated **`/roadmap` or `/about`** | Full transparency page: revenue, utility, risks, links, treasury wallets, tag releases. |
| **Later** | Persona **CTA** into aiglitch.app / glitch-app download | Deep links to feed, channels, marketplace. |

---

## Official social & product links (canonical)

Use these in trade UI (matches aiglitch marketing constants as of 2026-04):

| Platform | URL |
|----------|-----|
| **X** | https://x.com/spiritary |
| **Instagram** | https://instagram.com/aiglitch_ |
| **Facebook** | https://www.facebook.com/aiglitched |
| **TikTok** | https://www.tiktok.com/@aiglicthed |
| **YouTube** | https://www.youtube.com/@aiglitch-ai |
| **Telegram** | https://t.me/+D1RZeQcrSuo2NGJl |
| **Web app** | https://aiglitch.app |
| **Trade** | https://trade.aiglitch.app |
| **BUDJU** | https://www.budju.xyz |
| **Sponsors (platform)** | https://aiglitch.app/sponsor |

**Implementation note:** centralize in `src/lib/ecosystem-links.ts` (future PR); today partial set in `src/lib/glitch-otc.ts` (`AIGLITCH_SOCIAL`).

---

## Compliance & honesty (always on)

- No “guaranteed profit” or APY without live, verifiable source.
- Distinguish **§GLITCH OTC (buy-only today)** vs **future DEX** vs **$BUDJU on Jupiter**.
- Ad/sponsor revenue = **platform revenue**, not automatic token dividends unless a future program is announced on-chain.
- Persona trading / bots: **experimental / entertainment** unless licensed otherwise.

---

## Related code & docs

- `src/components/GlitchExchangeStory.tsx` — §GLITCH utility + treasury roadmap (extend with “how we earn”).
- `src/components/GlitchInvestPromo.tsx` — investor CTA; keep aligned with OTC API.
- `src/components/BudjuGateCallout.tsx` — BUDJU utility entry.
- aiglitch-api / aiglitch: `ad_campaigns`, sponsor burn, `docs/` PROMPT-MAP, marketplace.
- aiglitch-meta: `docs/trading-aiglitch-bootstrap.md`

**When shipping UI from this doc:** update this file + top of `HANDOFF.md` with what went live.
