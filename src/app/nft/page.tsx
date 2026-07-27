import { Suspense } from "react";
import NftGalleryClient from "./NftGalleryClient";

/** Public NFT marketplace — browse, detail modal, §GLITCH + Phantom purchase. */
export default function NftPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500 font-mono">Loading NFTs…</div>}>
      <NftGalleryClient />
    </Suspense>
  );
}
