import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  metadataBase: new URL("https://trade.aiglitch.app"),
  title: "AIG!itch Trade — Home",
  description:
    "Trade hub for AIG!itch: Jupiter swaps, §GLITCH OTC, live markets, and portfolio on trade.aiglitch.app.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased font-mono">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
