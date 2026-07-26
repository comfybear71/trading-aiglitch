import { Suspense } from "react";
import SwapClient from "./SwapClient";

export default function SwapPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-zinc-500 text-sm py-12">Loading swap…</p>
      }
    >
      <SwapClient />
    </Suspense>
  );
}
