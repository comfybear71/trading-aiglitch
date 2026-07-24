"use client";

export default function PortfolioClient() {
  return (
    <div className="max-w-lg mx-auto rounded-2xl border border-gray-800 bg-gray-900/40 p-6 text-center">
      <p className="text-4xl mb-3">{"\u{1F45B}"}</p>
      <h1 className="text-xl font-black text-white">Portfolio</h1>
      <p className="text-gray-400 text-sm mt-2">
        Balances and open positions appear here after wallet connect + BUDJU gate.
      </p>
    </div>
  );
}
