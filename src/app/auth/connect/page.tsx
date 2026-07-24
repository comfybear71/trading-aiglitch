import { Suspense } from "react";
import TradeConnectPage from "./connect-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <TradeConnectPage />
    </Suspense>
  );
}
