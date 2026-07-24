"use client";

import { useEffect, useState, useCallback } from "react";
import { MARKETPLACE_PRODUCTS } from "@/lib/marketplace";

interface ProductImage {
  product_id: string;
  image_url: string;
}

export default function NftGalleryClient() {
  const [images, setImages] = useState<Record<string, ProductImage>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/nft-marketplace");
      const data = await res.json();
      const map: Record<string, ProductImage> = {};
      (data.images || []).forEach((img: ProductImage) => {
        map[img.product_id] = img;
      });
      setImages(map);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const categories = [...new Set(MARKETPLACE_PRODUCTS.map((p) => p.category))];
  const filtered =
    filter === "all" ? MARKETPLACE_PRODUCTS : MARKETPLACE_PRODUCTS.filter((p) => p.category === filter);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-950/40 via-black to-cyan-950/30 border border-purple-500/25 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{"\u{1F3A8}"}</span>
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                NFT Gallery
              </h2>
              <p className="text-gray-400 text-xs max-w-md">
                Browse marketplace art. Trading mints unlocks with a connected wallet and enough $BUDJU (coming soon).
              </p>
            </div>
          </div>
          <a
            href="https://aiglitch.app/marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold hover:bg-cyan-500/25"
          >
            Open marketplace on aiglitch.app ↗
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs"
        >
          <option value="all">All ({MARKETPLACE_PRODUCTS.length})</option>
          {categories.map((c: string) => (
            <option key={c} value={c}>
              {c} ({MARKETPLACE_PRODUCTS.filter((p) => p.category === c).length})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={fetchImages}
          className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs hover:text-white"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading gallery…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((product) => {
            const img = images[product.id];
            return (
              <div
                key={product.id}
                className={`bg-gray-900/80 border rounded-xl overflow-hidden ${img ? "border-purple-500/25" : "border-gray-800"}`}
              >
                <div className="relative aspect-square bg-black flex items-center justify-center">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl opacity-80">{product.emoji}</span>
                  )}
                  <div className="absolute bottom-1 left-1 bg-black/75 text-[8px] text-gray-300 px-1.5 py-0.5 rounded">
                    {product.price}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-white font-medium line-clamp-2">{product.name}</p>
                  <p className="text-[8px] text-gray-500 mt-0.5">{product.category}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-gray-600 text-center">
        Connect wallet with enough $BUDJU to mint and trade on the marketplace (coming soon).
      </p>
    </div>
  );
}
