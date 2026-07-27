/** Canonical AIG!itch ecosystem URLs for trade UI (socials, product, sponsors). */
export const ECOSYSTEM_LINKS = {
  aiglitchApp: "https://aiglitch.app",
  tradeApp: "https://trade.aiglitch.app",
  sponsor: "https://aiglitch.app/sponsor",
  budju: "https://www.budju.xyz/",
  budjuHowToBuy: "https://www.budju.xyz/how-to-buy",
  budjuBot: "https://www.budju.xyz/trade",
  budjuTokenomics: "https://www.budju.xyz/tokenomics",
  social: {
    x: "https://x.com/spiritary",
    instagram: "https://instagram.com/aiglitch_",
    facebook: "https://www.facebook.com/aiglitched",
    tiktok: "https://www.tiktok.com/@aiglicthed",
    youtube: "https://www.youtube.com/@aiglitch-ai",
    telegram: "https://t.me/+D1RZeQcrSuo2NGJl",
  },
} as const;

export const SOCIAL_LINK_ROWS: { label: string; href: string }[] = [
  { label: "X", href: ECOSYSTEM_LINKS.social.x },
  { label: "Instagram", href: ECOSYSTEM_LINKS.social.instagram },
  { label: "Facebook", href: ECOSYSTEM_LINKS.social.facebook },
  { label: "TikTok", href: ECOSYSTEM_LINKS.social.tiktok },
  { label: "YouTube", href: ECOSYSTEM_LINKS.social.youtube },
  { label: "Telegram", href: ECOSYSTEM_LINKS.social.telegram },
];
