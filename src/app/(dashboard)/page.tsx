'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useCoins } from '@/hooks/queries/useCoins';
import { usePriceStream } from '@/hooks/realtime/usePriceStream';
import { usePriceStore } from '@/store/price.store';
import { cn } from '@/lib/utils';

const inputCls =
  'h-9 w-64 rounded-lg border border-border bg-input/30 px-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all';

function fmt(val: string | number) {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page] = useState(1);

  const { data: coins, isLoading } = useCoins(page);
  const prices = usePriceStore((s) => s.prices);

  // Subscribe all coin prices via WebSocket
  usePriceStream();

  const filtered = (coins ?? []).filter(
    (c) =>
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Markets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live prices from Binance</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[48px_1fr_160px_160px_100px_80px] gap-4 px-4 py-3 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">#</span>
          <span className="text-xs font-medium text-muted-foreground">Coin</span>
          <span className="text-xs font-medium text-muted-foreground text-right">Price</span>
          <span className="text-xs font-medium text-muted-foreground text-right">24h Change</span>
          <span className="text-xs font-medium text-muted-foreground text-right">Volume</span>
          <span />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((coin) => {
              const live = prices[coin.id];
              const price = live?.price ?? coin.currentPrice;
              const change = live?.change24h ?? coin.priceChange24h;
              const volume = live?.volume24h;
              const isUp = parseFloat(change) >= 0;

              return (
                <div
                  key={coin.id}
                  onClick={() => router.push(`/dashboard/trade/${coin.id}`)}
                  className="grid grid-cols-[48px_1fr_160px_160px_100px_80px] gap-4 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors items-center group"
                >
                  <span className="text-xs text-muted-foreground font-mono">
                    {coin.marketCapRank}
                  </span>
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{coin.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{coin.symbol}</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-foreground text-right">
                    ${fmt(price)}
                  </span>
                  <div className="flex items-center justify-end gap-1.5">
                    {isUp ? (
                      <TrendingUp className="w-3.5 h-3.5 text-trade-green" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-trade-red" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-mono',
                        isUp ? 'text-trade-green' : 'text-trade-red'
                      )}
                    >
                      {isUp ? '+' : ''}{parseFloat(change).toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground text-right">
                    {volume ? `$${(parseFloat(volume) / 1e6).toFixed(1)}M` : '—'}
                  </span>
                  <div className="flex justify-end">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}