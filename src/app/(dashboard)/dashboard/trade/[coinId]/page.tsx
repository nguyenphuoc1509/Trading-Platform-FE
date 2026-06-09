'use client';

import { useState, use } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import Link from 'next/link';
import { KLINE_INTERVALS, type KlineInterval } from '@/types/coin.types';
import { useCoins } from '@/hooks/queries/useCoins';
import { usePriceStream } from '@/hooks/realtime/usePriceStream';
import { usePriceStore } from '@/store/price.store';
import { useOrders } from '@/hooks/queries/useOrders';
import { useCancelOrder } from '@/hooks/mutations/useCancleOrder';
import TradingChart from '@/components/chart/TradingChart';
import OrderForm from '@/components/order/OrderForm';
import { cn } from '@/lib/utils';

function fmt(v: string | number, dec = 2) {
  return Number(v).toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: 8,
  });
}

const STATUS_STYLE: Record<string, string> = {
  EXECUTED:  'text-trade-green  bg-trade-green/10  border-trade-green/20',
  PENDING:   'text-trade-gold   bg-trade-gold/10   border-trade-gold/20',
  CANCELLED: 'text-muted-foreground bg-muted/40   border-border',
};

export default function TradePage({
  params,
}: {
  params: Promise<{ coinId: string }>;
}) {
  const { coinId } = use(params);
  const [interval, setInterval] = useState<KlineInterval>('1h');
  const [orderTab, setOrderTab] = useState<'all' | 'pending'>('all');

  const { data: coins } = useCoins(1);
  const coin = coins?.find((c) => c.id === coinId);
  const livePrice = usePriceStore((s) => s.getPrice(coinId));

  usePriceStream(coinId);

  const { data: orders } = useOrders();
  const cancelMutation = useCancelOrder();

  const allOrders = (orders ?? []).filter(
    (o) => o.symbol === (coin?.symbol ?? coinId.toUpperCase()) || o.coinName === coin?.name
  );
  const shownOrders =
    orderTab === 'pending'
      ? allOrders.filter((o) => o.status === 'PENDING')
      : allOrders;

  const price  = livePrice?.price    ?? coin?.currentPrice  ?? '—';
  const change = livePrice?.change24h ?? coin?.priceChange24h ?? '0';
  const isUp   = parseFloat(change) >= 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-card/50 shrink-0 flex-wrap gap-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Markets
        </Link>

        <div className="w-px h-5 bg-border shrink-0" />

        {coin && (
          <div className="flex items-center gap-2.5 shrink-0">
            <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
            <div>
              <span className="text-sm font-semibold text-foreground">{coin.name}</span>
              <span className="text-xs text-muted-foreground ml-1.5 font-mono">
                {coin.symbol}/USDT
              </span>
            </div>
          </div>
        )}

        {/* Live price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-mono font-semibold text-foreground">
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
          <div className="flex items-center gap-5 ml-2 text-xs font-mono flex-wrap gap-y-1">
            <div>
              <span className="text-muted-foreground">24H High </span>
              <span className="text-trade-green">${fmt(livePrice.high24h)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">24H Low </span>
              <span className="text-trade-red">${fmt(livePrice.low24h)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Open </span>
              <span className="text-foreground">${fmt(livePrice.open24h)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Vol </span>
              <span className="text-foreground">
                {(parseFloat(livePrice.volume24h) / 1e6).toFixed(2)}M
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chart + order history */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Interval selector */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card/20 shrink-0">
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

          {/* Chart */}
          <div className="flex-1 px-3 pt-3 pb-1 min-h-0">
            <TradingChart coinId={coinId} interval={interval} />
          </div>

          {/* Order history */}
          <div className="border-t border-border shrink-0 max-h-[220px] overflow-auto">
            {/* Sub-tabs */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
              {(['all', 'pending'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOrderTab(tab)}
                  className={cn(
                    'text-xs font-medium transition-colors capitalize',
                    orderTab === tab
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab === 'all' ? 'Order History' : 'Pending'}
                  {tab === 'pending' && allOrders.filter((o) => o.status === 'PENDING').length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-trade-gold/15 text-trade-gold">
                      {allOrders.filter((o) => o.status === 'PENDING').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {shownOrders.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                No orders yet.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {['Side', 'Type', 'Qty', 'Price', 'Exec. Price', 'Total', 'Status', 'Time', ''].map((h) => (
                      <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shownOrders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-muted/20 transition-colors">
                      <td className={cn(
                        'px-4 py-2 font-semibold',
                        o.side === 'BUY' ? 'text-trade-green' : 'text-trade-red'
                      )}>
                        {o.side}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground font-mono">{o.orderType}</td>
                      <td className="px-4 py-2 font-mono">{parseFloat(o.quantity).toFixed(6)}</td>
                      <td className="px-4 py-2 font-mono">${fmt(o.price)}</td>
                      <td className="px-4 py-2 font-mono text-muted-foreground">
                        {o.executedPrice ? `$${fmt(o.executedPrice)}` : '—'}
                      </td>
                      <td className="px-4 py-2 font-mono">${fmt(o.totalValue)}</td>
                      <td className="px-4 py-2">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-medium border',
                          STATUS_STYLE[o.status]
                        )}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2">
                        {o.status === 'PENDING' && (
                          <button
                            onClick={() => cancelMutation.mutate(o.orderId)}
                            disabled={cancelMutation.isPending}
                            className="text-destructive hover:underline text-[10px] font-medium disabled:opacity-50 whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order form panel */}
        <div className="w-[280px] shrink-0 border-l border-border bg-card/40 p-4 overflow-auto">
          <h3 className="text-sm font-semibold text-foreground mb-4">Place Order</h3>
          <OrderForm
            coinId={coinId}
            symbol={coin?.symbol ?? coinId.toUpperCase()}
          />
        </div>
      </div>
    </div>
  );
}