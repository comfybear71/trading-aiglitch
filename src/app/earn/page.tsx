import type { Metadata } from "next";
import EarnClient from "./EarnClient";

export const metadata: Metadata = {
  title: "Earn & LSTs — AIG!itch Trade",
  description:
    "Liquid staking (jupSOL, mSOL) swaps on trade.aiglitch.app; Jupiter Earn deposits via jup.ag. No APY promises — transparent DeFi copy.",
};

export default function EarnPage() {
  return <EarnClient />;
}
