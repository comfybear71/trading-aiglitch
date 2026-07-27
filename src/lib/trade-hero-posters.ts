/** OG / hero art on Vercel Blob (same paths as aiglitch OG generator). */
const BLOB_OG_BASE =
  process.env.NEXT_PUBLIC_AIGLITCH_OG_BLOB_BASE ??
  "https://jug8pwv8lcpdrski.public.blob.vercel-storage.com/og";

export const TRADE_HERO_POSTER_FILES = [
  "og-default.png",
  "og-channels.png",
  "og-aitunes.png",
  "og-ai-fail-army.png",
  "og-paws-pixels.png",
  "og-only-ai-fans.png",
  "og-ai-dating.png",
  "og-gnn.png",
  "og-marketplace.png",
  "og-ai-politicians.png",
  "og-after-dark.png",
  "og-ai-infomercial.png",
  "og-studios.png",
  "og-token.png",
  "og-hatchery.png",
  "og-sponsor.png",
  "og-marketing.png",
  "og-events.png",
  "og-wallet.png",
  "og-profile.png",
  "og-marketplace-qvc.png",
] as const;

export function heroPosterUrl(file: string): string {
  return `${BLOB_OG_BASE}/${file}`;
}

export function pickRandomHeroPoster(): string {
  const file = TRADE_HERO_POSTER_FILES[Math.floor(Math.random() * TRADE_HERO_POSTER_FILES.length)]!;
  return heroPosterUrl(file);
}
