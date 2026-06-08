'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { usePortfolio } from '@/hooks/queries/usePortfolio';
import { usePriceStream } from '@/hooks/realtime/usePriceStream';
import { cn } from '@/lib/utils';

function fmt(v: string | number, dec = 2) {
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: 8 });
}

function StatCard({
  label, value, sub, positive,
}: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <p className="text-xl font-mono font-semibold text-foreground">{value}</p>
      {sub !== undefined && (
        <p
          className={cn(
            'text-sm font-mono mt-1',
            positive === true ? 'text-trade-green' : positive === false ? 'text-trade-red' : 'text-muted-foreground'
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const router = useRouter();
  const { data: portfolio, isLoading, refetch, isFetching } = usePortfolio();

  // Keep live prices flowing for any holdings
  usePriceStream();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Loading portfolio...
      </div>
    );
  }

  const totalPnl = parseFloat(portfolio?.totalPnl ?? '0');
  const isProfit = totalPnl >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your holdings & P&amp;L</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Value"
          value={`$${fmt(portfolio?.totalValue ?? 0)}`}
        />
        <StatCard
          label="Total Cost"
          value={`$${fmt(portfolio?.totalCost ?? 0)}`}
        />
        <StatCard
          label="Unrealized P&L"
          value={`${isProfit ? '+' : ''}$${fmt(Math.abs(totalPnl))}`}
          sub={`${isProfit ? '+' : ''}${fmt(portfolio?.totalPnlPercentage ?? 0)}%`}
          positive={isProfit}
        />
        <StatCard
          label="Assets"
          value={`${portfolio?.items?.length ?? 0} coins`}
          sub={portfolio?.updatedAt
            ? new Date(portfolio.updatedAt).toLocaleTimeString()
            : undefined}
        />
      </div>

      {/* Holdings table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_130px_130px_130px_110px] gap-4 px-4 py-3 border-b border-border">
          {['Asset', 'Quantity', 'Avg Buy Price', 'Current Price', 'Current Value', 'P&L'].map((h) => (
            <span key={h} className="text-xs font-medium text-muted-foreground last:text-right">
              {h}
            </span>
          ))}
        </div>

        {!portfolio?.items?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-muted-foreground">No holdings yet.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-primary hover:underline"
            >
              Start trading →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {portfolio.items.map((item) => {
              const pnl = parseFloat(item.pnl);
              const pct = parseFloat(item.pnlPercentage);
              const up = item.isProfitable;

              return (
                <div
                  key={item.itemId}
                  onClick={() => router.push(`/dashboard/trade/${item.coin.id}`)}
                  className="grid grid-cols-[1fr_120px_130px_130px_130px_110px] gap-4 px-4 py-4 hover:bg-muted/25 cursor-pointer transition-colors items-center"
                >
                  {/* Asset */}
                  <div className="flex items-center gap-3">
                    <img src={item.coin.image} alt={item.coin.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.coin.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.coin.symbol}</p>
                    </div>
                  </div>

                  <span className="text-sm font-mono text-foreground">
                    {parseFloat(item.quantity).toFixed(6)}
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    ${fmt(item.avgBuyPrice)}
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    ${fmt(item.currentPrice)}
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    ${fmt(item.currentValue)}
                  </span>

                  {/* P&L */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      {up ? (
                        <TrendingUp className="w-3.5 h-3.5 text-trade-green" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-trade-red" />
                      )}
                      <span className={cn('text-sm font-mono', up ? 'text-trade-green' : 'text-trade-red')}>
                        {up ? '+' : ''}${fmt(Math.abs(pnl))}
                      </span>
                    </div>
                    <span className={cn('text-xs font-mono', up ? 'text-trade-green' : 'text-trade-red')}>
                      {up ? '+' : ''}{pct.toFixed(2)}%
                    </span>
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