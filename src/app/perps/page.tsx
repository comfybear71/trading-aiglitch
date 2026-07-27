import type { Metadata } from "next";
import PerpsClient from "./PerpsClient";

export const metadata: Metadata = {
  title: "Perps (high risk) — AIG!itch Trade",
  description:
    "Native AIG!itch perps (in development): 1M $BUDJU gate and risk acknowledgement on trade.aiglitch.app. Not financial advice.",
  robots: { index: false, follow: false },
};

export default function PerpsPage() {
  return <PerpsClient />;
}
