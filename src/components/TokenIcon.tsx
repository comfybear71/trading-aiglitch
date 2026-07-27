"use client";

import { useState } from "react";

export function TokenIcon({
  symbol,
  iconUrl,
  iconEmoji,
  size = 28,
  className = "",
}: {
  symbol: string;
  iconUrl?: string | null;
  iconEmoji?: string;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showImg = iconUrl && !broken;
  const box = `shrink-0 rounded-full overflow-hidden bg-zinc-800/80 flex items-center justify-center ${className}`;
  const style = { width: size, height: size };

  if (showImg) {
    return (
      <img
        src={iconUrl}
        alt=""
        width={size}
        height={size}
        className={`${box} object-cover`}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span
      className={`${box} text-[11px] font-black text-zinc-200`}
      style={style}
      aria-hidden
      title={symbol}
    >
      {iconEmoji ?? symbol.slice(0, 1)}
    </span>
  );
}
