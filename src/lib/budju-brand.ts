/** $BUDJU ecosystem branding — aligned with https://www.budju.xyz/ */
export const BUDJU_SITE = {
  home: "https://www.budju.xyz/",
  logo: "https://www.budju.xyz/images/logo.svg",
  trade: "https://www.budju.xyz/trade",
  /** DCA trading bot (deposit + automated trades on budju.xyz). */
  dcaBot: "https://www.budju.xyz/trade",
  tokenomics: "https://www.budju.xyz/tokenomics",
} as const;

/** Tailwind-friendly tokens (match budju.xyz magenta + deep purple UI). */
export const BUDJU_BRAND = {
  pink: "#e879f9",
  magenta: "#d946ef",
  deep: "#1a0533",
  panel: "#140820",
} as const;

/** Minimum $BUDJU in connected wallet to unlock full AIG!itch Trade (swap gate). */
export const BUDJU_GATE_REQUIRED_DEFAULT = 1_000_000;

/** Minimum $BUDJU to access the budju.xyz DCA trading bot (separate from trade gate). */
export const BUDJU_BOT_REQUIRED = 10_000_000;
