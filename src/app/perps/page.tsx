import type { Metadata } from "next";
import PerpsClient from "./PerpsClient";

export const metadata: Metadata = {
  title: "Perps (high risk) — AIG!itch Trade",
  description:
    "Jupiter Perps access from trade.aiglitch.app: 1M $BUDJU gate, risk acknowledgement, link to jup.ag. Not financial advice.",
  robots: { index: false, follow: false },
};

export default function PerpsPage() {
  return <PerpsClient />;
}
