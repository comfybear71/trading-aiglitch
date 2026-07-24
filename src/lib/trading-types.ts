export interface TradingData {
  price: { current_sol: number; current_usd: number; sol_usd: number };
  stats_24h: { total_trades: number; buys: number; sells: number; volume_sol: number; volume_glitch: number; avg_price: number; high: number; low: number };
  order_book: {
    bids: { price: number; amount: number; total: number; count: number }[];
    asks: { price: number; amount: number; total: number; count: number }[];
  };
  recent_trades: { id: string; trade_type: string; glitch_amount: number; sol_amount: number; price_per_glitch: number; commentary: string; strategy: string; created_at: string; display_name: string; avatar_emoji: string; username: string }[];
  price_history: { time: string; open: number; high: number; low: number; close: number; volume: number; trades: number }[];
  leaderboard: { persona_id: string; display_name: string; avatar_emoji: string; username: string; total_trades: number; total_bought: number; total_sold: number; net_sol: number; net_glitch: number; strategy: string }[];
  holdings: { persona_id: string; display_name: string; avatar_emoji: string; username: string; glitch_balance: number; sol_balance: number }[];
}

export interface BudjuDashboard {
  config: {
    enabled: boolean;
    daily_budget_usd: number;
    max_trade_usd: number;
    min_trade_usd: number;
    min_interval_minutes: number;
    max_interval_minutes: number;
    buy_sell_ratio: number;
    active_persona_count: number;
    priority_fee: string;
  };
  price: { budju_usd: number; budju_sol: number; sol_usd: number };
  budget: { daily_limit: number; spent_today: number; remaining: number };
  stats_24h: { total_trades: number; buys: number; sells: number; confirmed: number; failed: number; volume_sol: number; volume_usd: number; volume_budju: number; avg_price: number; high: number; low: number };
  stats_all_time: { total_trades: number; total_volume_usd: number; total_volume_sol: number };
  recent_trades: { id: string; persona_id: string; wallet_address: string; trade_type: string; budju_amount: number; sol_amount: number; price_per_budju: number; usd_value: number; dex_used: string; tx_signature: string | null; strategy: string; commentary: string; status: string; error_message: string | null; created_at: string; display_name: string; avatar_emoji: string; username: string }[];
  leaderboard: { persona_id: string; display_name: string; avatar_emoji: string; username: string; total_trades: number; confirmed_trades: number; total_bought: number; total_sold: number; total_volume_usd: number; strategy: string }[];
  wallets: { persona_id: string; wallet_address: string; sol_balance: number; budju_balance: number; usdc_balance: number; glitch_balance: number; distributor_group: number; is_active: boolean; total_funded_sol: number; total_funded_budju: number; display_name: string; avatar_emoji: string; username: string }[];
  distributors: { id: string; group_number: number; wallet_address: string; sol_balance: number; budju_balance: number; personas_funded: number }[];
  price_history: { time: string; open: number; high: number; low: number; close: number; volume: number; trades: number }[];
  treasury_wallet: string;
  budju_mint: string;
  jupiter_api_key_set?: boolean;
}

export function formatBudjuAmount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toString();
}
