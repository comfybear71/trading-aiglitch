export interface NavItem {
  slug: string;
  label: string;
  icon: string;
}

export const NAV: NavItem[] = [
  { slug: "overview", label: "Overview", icon: "\u{1F4CA}" },
  { slug: "trading", label: "Trading", icon: "\u{1F4C8}" },
  { slug: "nft", label: "NFT Art", icon: "\u{1F3A8}" },
];

export const DEFAULT_SLUG = NAV[0].slug;

export function navItemForSlug(slug: string): NavItem | undefined {
  return NAV.find((item) => item.slug === slug);
}
