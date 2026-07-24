"use client";

import { Suspense } from "react";
import SignPage from "./sign-page";

export default function AuthSignRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
          Loading…
        </div>
      }
    >
      <SignPage />
    </Suspense>
  );
}
