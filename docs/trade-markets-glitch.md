# §GLITCH market — trade.aiglitch.app

## Source of truth

§GLITCH is **not on Jupiter**. The platform controls buy pricing via the **on-chain OTC bonding curve** — same system as [aiglitch.app/exchange](https://aiglitch.app/exchange).

| Rule | Detail |
|------|--------|
| **Price step** | +**$0.01** for every **10,000** §GLITCH sold |
| **Buy** | SOL → treasury; treasury → buyer (atomic tx via `/api/otc-swap`) |
| **Pay with** | **SOL only** on exchange (not USDC direct on OTC) |
| **Per tx** | 100 – 1,000,000 §GLITCH (`min_purchase` / `max_purchase` from API) |
| **Per wallet / 24h** | **0.5 SOL** max (`OTC.dailySolLimit` on API) |
| **Treasury** | `7SGf93WGk7VpSmreARzNujPbEpyABq2Em9YvaCirWi56` |
| **5,000 SOL goal** | Stack treasury before Raydium/Jupiter listing — thin pools get drained by bots; SOL also funds listings and promotion |

## Trade app behavior

| Surface | Behavior |
|---------|----------|
| **Swap** | Jupiter: SOL · USDC · BUDJU only. URL `?buy=GLITCH` shows OTC callout + link to exchange (no Jupiter quote). |
| **Markets** | §GLITCH **GlitchInvestPromo** hero: treasury bar, stats, limits, invest CTA |
| **Portfolio** | Compact fundraise strip → exchange |

API proxy: `/api/otc-swap` → api.aiglitch.app (see `next.config.ts`).

Do not show DexScreener/Jupiter as the official §GLITCH price on Markets.
