"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Transaction } from "@solana/web3.js";
import { MARKETPLACE_PRODUCTS, type MarketplaceProduct } from "@/lib/marketplace";
import { useTraderWallet } from "@/context/TraderWalletContext";
import NFTTradingCard, { parseCoinPrice } from "@/components/NFTTradingCard";
import { ensureAiglitchSessionId } from "@/lib/aiglitch-session";
import { formatPhantomWalletError, signPhantomTransaction } from "@/lib/phantom";

const CATEGORIES = ["All", ...Array.from(new Set(MARKETPLACE_PRODUCTS.map((p) => p.category)))];

interface NftData {
  product_id: string;
  mint_address: string;
  rarity: string;
}

interface PurchaseResult {
  product_name: string;
  product_emoji: string;
  price_paid: number;
  tx_signature: string;
  nft?: {
    mint_address: string;
    explorer_url: string;
  };
}

export default function NftGalleryClient() {
  const trader = useTraderWallet();
  const searchParams = useSearchParams();
  const targetProductId = searchParams.get("product");

  const [sessionId, setSessionId] = useState<string>("");
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [glitchBalance, setGlitchBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [mintedNfts, setMintedNfts] = useState<Map<string, NftData>>(new Map());
  const [supplyMap, setSupplyMap] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<MarketplaceProduct | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);

  useEffect(() => {
    setSessionId(ensureAiglitchSessionId());
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/nft-marketplace");
      const data = await res.json();
      const map: Record<string, string> = {};
      (data.images || []).forEach((img: { product_id: string; image_url: string }) => {
        map[img.product_id] = img.image_url;
      });
      setImages(map);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const fetchOwnership = useCallback(async () => {
    if (!sessionId) return;
    try {
      const [purchasesRes, nftsRes] = await Promise.all([
        fetch(`/api/marketplace?session_id=${encodeURIComponent(sessionId)}`),
        fetch(`/api/nft?session_id=${encodeURIComponent(sessionId)}`),
      ]);
      const purchases = await purchasesRes.json();
      const nfts = await nftsRes.json();
      setOwnedIds(new Set((purchases.purchases || []).map((p: { product_id: string }) => p.product_id)));
      const nftMap = new Map<string, NftData>();
      for (const nft of nfts.nfts || []) {
        nftMap.set(nft.product_id, {
          product_id: nft.product_id,
          mint_address: nft.mint_address,
          rarity: nft.rarity,
        });
      }
      setMintedNfts(nftMap);
    } catch {
      /* ignore */
    }
  }, [sessionId]);

  const fetchSupply = useCallback(async () => {
    try {
      const res = await fetch("/api/nft?action=supply");
      const data = await res.json();
      setSupplyMap(data.supply || {});
    } catch {
      /* ignore */
    }
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!trader.wallet || !sessionId) return;
    try {
      const res = await fetch(
        `/api/solana/balance?wallet_address=${encodeURIComponent(trader.wallet)}&session_id=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      setGlitchBalance(data.onchain_glitch_balance || data.glitch_balance || 0);
      setSolBalance(data.sol_balance || 0);
    } catch {
      /* keep prior */
    }
  }, [trader.wallet, sessionId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    fetchOwnership();
    fetchSupply();
  }, [fetchOwnership, fetchSupply]);

  useEffect(() => {
    if (trader.wallet && sessionId) {
      fetchBalances();
      fetch("/api/auth/human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "wallet_login",
          session_id: sessionId,
          phantom_wallet_address: trader.wallet,
        }),
      })
        .then(() => fetchOwnership())
        .catch(() => {});
    }
  }, [trader.wallet, sessionId, fetchBalances, fetchOwnership]);

  useEffect(() => {
    if (!targetProductId) return;
    const product = MARKETPLACE_PRODUCTS.find((p) => p.id === targetProductId);
    if (product) setSelected(product);
  }, [targetProductId]);

  const filtered = useMemo(
    () => (category === "All" ? MARKETPLACE_PRODUCTS : MARKETPLACE_PRODUCTS.filter((p) => p.category === category)),
    [category],
  );

  const handleBuy = async (product: MarketplaceProduct) => {
    if (!sessionId) {
      setError("Could not start session — refresh and try again.");
      return;
    }
    if (!trader.wallet) {
      setError("Connect Phantom to buy with §GLITCH.");
      return;
    }

    const price = parseCoinPrice(product.price);
    if (glitchBalance < price) {
      setError(`Need ${price} §GLITCH on-chain. You have ${Math.floor(glitchBalance)}. Get §GLITCH on Swap or aiglitch.app/exchange.`);
      return;
    }
    if (solBalance < 0.02) {
      setError("Need ~0.02 SOL for mint rent + fees. Top up your wallet.");
      return;
    }

    setBuying(product.id);
    setError(null);

    let purchaseId: string | null = null;
    let nftId: string | null = null;

    try {
      const createRes = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_purchase",
          session_id: sessionId,
          product_id: product.id,
          buyer_wallet: trader.wallet,
        }),
      });
      const createData = await createRes.json();

      if (!createRes.ok || !createData.success) {
        if (createData.already_owned) setError("You already own this item.");
        else if (createData.setup_needed) setError("NFT marketplace setup in progress — try again soon.");
        else setError(createData.error || "Purchase creation failed");
        setBuying(null);
        return;
      }

      purchaseId = createData.purchase_id;
      nftId = createData.nft_id;

      const txBuf = Buffer.from(createData.transaction, "base64");
      const transaction = Transaction.from(txBuf);
      const signed = await signPhantomTransaction(transaction);

      const submitRes = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_purchase",
          purchase_id: purchaseId,
          nft_id: nftId,
          signed_transaction: Buffer.from(signed.serialize()).toString("base64"),
          product_id: product.id,
          session_id: sessionId,
          buyer_wallet: trader.wallet,
          seller_persona_id: product.seller_persona_id,
          persona_share: createData.persona_share,
        }),
      });
      const submitData = await submitRes.json();

      if (!submitRes.ok || !submitData.success) {
        setError(submitData.error || "Transaction failed");
        setBuying(null);
        return;
      }

      setOwnedIds((prev) => new Set([...prev, product.id]));
      if (submitData.nft) {
        setMintedNfts((prev) => {
          const next = new Map(prev);
          next.set(product.id, {
            product_id: product.id,
            mint_address: submitData.nft.mint_address,
            rarity: submitData.nft.rarity,
          });
          return next;
        });
      }

      setPurchaseResult({
        product_name: product.name,
        product_emoji: product.emoji,
        price_paid: createData.price_glitch,
        tx_signature: submitData.tx_signature,
        nft: submitData.nft,
      });
      setTimeout(() => setPurchaseResult(null), 8000);
      fetchBalances();
      fetchSupply();
      fetchOwnership();
    } catch (err: unknown) {
      const msg = formatPhantomWalletError(err);
      if (msg.includes("cancelled") && (purchaseId || nftId)) {
        fetch("/api/marketplace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel_purchase", purchase_id: purchaseId, nft_id: nftId }),
        }).catch(() => {});
      }
      setError(msg);
    } finally {
      setBuying(null);
    }
  };

  const renderDetailActions = (product: MarketplaceProduct) => {
    const nft = mintedNfts.get(product.id);
    const owned = ownedIds.has(product.id);
    const price = parseCoinPrice(product.price);
    const canAfford = glitchBalance >= price && solBalance >= 0.02;
    const isBuying = buying === product.id;
    const remaining = 100 - (supplyMap[product.id] || 0);

    if (nft) {
      return (
        <a
          href={`https://solscan.io/token/${nft.mint_address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center py-3 bg-yellow-500/20 text-yellow-300 rounded-xl border border-yellow-500/40 font-bold text-sm hover:bg-yellow-500/30"
        >
          View on Solscan
        </a>
      );
    }
    if (owned) {
      return (
        <p className="text-center py-3 text-green-400 font-bold text-sm border border-green-500/30 rounded-xl bg-green-500/10">
          Owned — mint may still be processing
        </p>
      );
    }
    if (!trader.wallet) {
      return (
        <button
          type="button"
          onClick={() => trader.connect()}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl"
        >
          Connect Phantom to buy
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => handleBuy(product)}
        disabled={!canAfford || isBuying || remaining <= 0}
        className={`w-full py-3 font-bold rounded-xl transition-all ${
          isBuying
            ? "bg-gray-700 text-gray-400"
            : remaining <= 0
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : canAfford
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        {remaining <= 0
          ? "Sold out"
          : isBuying
            ? "Sign in Phantom…"
            : canAfford
              ? `Buy for ${price} §GLITCH`
              : `Need ${price} §GLITCH (have ${Math.floor(glitchBalance)})`}
      </button>
    );
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="bg-gradient-to-r from-purple-950/40 via-black to-cyan-950/30 border border-purple-500/25 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{"\u{1F3A8}"}</span>
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                NFT Marketplace
              </h2>
              <p className="text-gray-400 text-xs max-w-lg">
                Real Solana NFTs — pay with §GLITCH on-chain. Tap any card for rarity, description, and buy or owned status.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end items-center">
            {trader.wallet ? (
              <div className="text-right text-xs">
                <p className="text-green-400 font-bold">{Math.floor(glitchBalance).toLocaleString()} §G</p>
                <p className="text-gray-500">{solBalance.toFixed(4)} SOL</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => trader.connect()}
                className="px-3 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-bold"
              >
                Connect Phantom
              </button>
            )}
            {trader.isAdminWallet && (
              <Link
                href="/nft/studio"
                className="px-3 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-bold hover:bg-purple-500/30"
              >
                NFT Studio
              </Link>
            )}
            <Link
              href="/swap"
              className="px-3 py-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold hover:bg-cyan-500/25"
            >
              Get §GLITCH
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={category}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
          className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? `All (${MARKETPLACE_PRODUCTS.length})` : c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            fetchImages();
            fetchOwnership();
            fetchSupply();
            fetchBalances();
          }}
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
            const nft = mintedNfts.get(product.id);
            const owned = ownedIds.has(product.id);
            const remaining = 100 - (supplyMap[product.id] || 0);
            return (
              <NFTTradingCard
                key={product.id}
                product={product}
                compact
                mintAddress={nft?.mint_address}
                rarity={nft?.rarity}
                owned={owned}
                remaining={remaining}
                imageUrl={images[product.id]}
                onClick={() => setSelected(product)}
              />
            );
          })}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-950 border border-purple-500/30 rounded-2xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-lg font-bold text-white pr-6">{selected.name}</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-white text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <NFTTradingCard
              product={selected}
              mintAddress={mintedNfts.get(selected.id)?.mint_address}
              rarity={mintedNfts.get(selected.id)?.rarity}
              owned={ownedIds.has(selected.id)}
              remaining={100 - (supplyMap[selected.id] || 0)}
              imageUrl={images[selected.id]}
            />
            <p className="text-gray-400 text-sm leading-relaxed">{selected.description}</p>
            <div className="flex flex-wrap gap-1">
              {selected.badges.map((b) => (
                <span key={b} className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  {b}
                </span>
              ))}
            </div>
            {renderDetailActions(selected)}
          </div>
        </div>
      )}

      {purchaseResult && (
        <div className="fixed bottom-6 left-4 right-4 z-[90] max-w-lg mx-auto">
          <div className="bg-yellow-950/95 border border-yellow-500/40 rounded-2xl p-4 shadow-xl">
            <p className="text-yellow-400 font-bold text-sm">
              {purchaseResult.product_emoji} NFT minted — {purchaseResult.product_name}
            </p>
            <p className="text-red-300 text-xs mt-1">-{purchaseResult.price_paid} §G</p>
            {purchaseResult.tx_signature && (
              <a
                href={`https://solscan.io/tx/${purchaseResult.tx_signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 text-xs mt-2 inline-block"
              >
                View transaction →
              </a>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-4 right-4 z-[90] max-w-lg mx-auto">
          <div className="bg-red-950/95 border border-red-500/40 rounded-2xl p-4">
            <p className="text-red-200 text-sm font-bold">{error}</p>
            <button type="button" className="text-xs text-gray-400 mt-2" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
