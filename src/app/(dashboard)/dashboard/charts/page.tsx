'use client';

import { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useCoins } from '@/hooks/queries/useCoins';
import { usePriceStream } from '@/hooks/realtime/usePriceStream';
import { usePriceStore } from '@/store/price.store';
import TradingChart from '@/components/chart/TradingChart';
import { KLINE_INTERVALS, type KlineInterval } from '@/types/coin.types';
import { cn } from '@/lib/utils';

function fmt(v: string | number, dec = 2) {
  return Number(v).toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: 8,
  });
}

export default function ChartsPage() {
  const [selectedId, setSelectedId] = useState('bitcoin');
  const [interval, setInterval]     = useState<KlineInterval>('1h');
  const [search, setSearch]         = useState('');

  const { data: coins, isLoading } = useCoins(1);
  const prices  = usePriceStore((s) => s.prices);
  const getLive = usePriceStore((s) => s.getPrice);

  // Subscribe all coins' prices
  usePriceStream();

  const selectedCoin = coins?.find((c) => c.id === selectedId);
  const livePrice    = getLive(selectedId);

  const price  = livePrice?.price    ?? selectedCoin?.currentPrice  ?? '—';
  const change = livePrice?.change24h ?? selectedCoin?.priceChange24h ?? '0';
  const isUp   = parseFloat(change) >= 0;

  const filtered = useMemo(
    () =>
      (coins ?? []).filter(
        (c) =>
          search === '' ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.symbol.toLowerCase().includes(search.toLowerCase())
      ),
    [coins, search]
  );

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Coin list sidebar ──────────────────────────────────── */}
      <div className="w-[200px] shrink-0 border-r border-border bg-card/30 flex flex-col">

        <div className="p-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 rounded-lg border border-border bg-input/30 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto divide-y divide-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              Loading...
            </div>
          ) : (
            filtered.map((coin) => {
              const live      = prices[coin.id];
              const coinPrice  = live?.price    ?? coin.currentPrice;
              const coinChange = live?.change24h ?? coin.priceChange24h;
              const up         = parseFloat(coinChange) >= 0;
              const active     = selectedId === coin.id;

              return (
                <button
                  key={coin.id}
                  onClick={() => setSelectedId(coin.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/40',
                    active && 'bg-primary/8 border-l-2 border-l-primary'
                  )}
                >
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-xs font-semibold truncate',
                      active ? 'text-primary' : 'text-foreground'
                    )}>
                      {coin.symbol}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      ${Number(coinPrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-mono shrink-0',
                    up ? 'text-trade-green' : 'text-trade-red'
                  )}>
                    {up ? '+' : ''}{parseFloat(coinChange).toFixed(2)}%
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chart area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Price bar */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-card/30 shrink-0 flex-wrap gap-y-2">

          {selectedCoin && (
            <div className="flex items-center gap-2.5 shrink-0">
              <img
                src={selectedCoin.image}
                alt={selectedCoin.name}
                className="w-7 h-7 rounded-full"
              />
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {selectedCoin.name}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5 font-mono">
                  {selectedCoin.symbol}/USDT
                </span>
              </div>
            </div>
          )}

          {/* Price + change */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-semibold text-foreground">
              ${fmt(price)}
            </span>
            <div className="flex items-center gap-1">
              {isUp
                ? <TrendingUp  className="w-3.5 h-3.5 text-trade-green" />
                : <TrendingDown className="w-3.5 h-3.5 text-trade-red"  />
              }
              <span className={cn('text-sm font-mono', isUp ? 'text-trade-green' : 'text-trade-red')}>
                {isUp ? '+' : ''}{parseFloat(change).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 24h stats */}
          {livePrice && (
            <div className="flex items-center gap-5 text-xs font-mono flex-wrap gap-y-1">
              <span>
                <span className="text-muted-foreground">High </span>
                <span className="text-trade-green">${fmt(livePrice.high24h)}</span>
              </span>
              <span>
                <span className="text-muted-foreground">Low </span>
                <span className="text-trade-red">${fmt(livePrice.low24h)}</span>
              </span>
              <span>
                <span className="text-muted-foreground">Open </span>
                <span className="text-foreground">${fmt(livePrice.open24h)}</span>
              </span>
              <span>
                <span className="text-muted-foreground">Vol </span>
                <span className="text-foreground">
                  {(parseFloat(livePrice.volume24h) / 1e6).toFixed(2)}M
                </span>
              </span>
            </div>
          )}

          {/* Interval + trade button — right side */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1">
              {KLINE_INTERVALS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setInterval(value)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                    interval === value
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link
              href={`/dashboard/trade/${selectedId}`}
              className="px-3 h-7 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/85 transition-colors flex items-center gap-1.5 shrink-0"
            >
              Trade
            </Link>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 p-4 min-h-0">
          <TradingChart coinId={selectedId} interval={interval} />
        </div>
      </div>
    </div>
  );
}