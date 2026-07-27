export interface NavItem {
  slug: string;
  label: string;
  icon: string;
  /** Shown in sidebar section header context */
  section?: "trade" | "manage";
  /** Override link (default `/${slug}`). Home uses `/`. */
  href?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Public trade shell — Jupiter-style grouping, AIG!itch scope only. */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Trade",
    items: [
      { slug: "home", label: "Home", icon: "\u{1F3E0}", section: "trade", href: "/" },
      { slug: "markets", label: "Markets", icon: "\u{1F4CA}", section: "trade" },
      { slug: "glitch", label: "Buy §GLITCH", icon: "\u{1F4B0}", section: "trade" },
      { slug: "swap", label: "Swap", icon: "\u{21C4}", section: "trade" },
      { slug: "earn", label: "Earn", icon: "\u{1F4B8}", section: "trade" },
      { slug: "nft", label: "NFT", icon: "\u{1F3A8}", section: "trade" },
    ],
  },
  {
    title: "Manage",
    items: [
      { slug: "portfolio", label: "Portfolio", icon: "\u{1F45B}", section: "manage" },
      { slug: "send", label: "Send", icon: "\u{1F4E8}", section: "manage" },
    ],
  },
];

export const OPS_NAV: NavItem = {
  slug: "ops",
  label: "Ops",
  icon: "\u{2699}\uFE0F",
};

export const ALL_PUBLIC_SLUGS = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.slug));

export const DEFAULT_SLUG = "home";

export function navItemHref(item: NavItem): string {
  return item.href ?? `/${item.slug}`;
}

export function navItemForSlug(slug: string): NavItem | undefined {
  if (slug === "home") {
    return NAV_SECTIONS[0]?.items.find((i) => i.slug === "home");
  }
  for (const section of NAV_SECTIONS) {
    const found = section.items.find((item) => item.slug === slug);
    if (found) return found;
  }
  if (slug === OPS_NAV.slug) return OPS_NAV;
  return undefined;
}

/** First path segment for sidebar highlight (e.g. /nft/studio → nft). */
export function slugFromPathname(pathname: string): string {
  const trimmed = pathname.replace(/\/$/, "") || "/";
  if (trimmed === "/") return "home";
  const seg = trimmed.split("/").filter(Boolean)[0];
  if (seg === "exchange") return "glitch";
  return seg ?? "home";
}
