'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuyOrder } from '@/hooks/mutations/useBuyOrder';
import { useSellOrder } from '@/hooks/mutations/useSellOrder';
import { useWallet } from '@/hooks/queries/useWallet';
import { usePriceStore } from '@/store/price.store';
import type { OrderMode, OrderSide } from '@/types/order.types';

interface OrderFormProps {
  coinId: string;
  symbol: string;
}

const inputCls =
  'w-full h-10 rounded-lg border border-border bg-input/30 px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all';

export default function OrderForm({ coinId, symbol }: OrderFormProps) {
  const [side, setSide] = useState<OrderSide>('BUY');
  const [mode, setMode] = useState<OrderMode>('MARKET');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: wallet } = useWallet();
  const livePrice = usePriceStore((s) => s.getPrice(coinId));

  const buyMutation = useBuyOrder();
  const sellMutation = useSellOrder();
  const isPending = buyMutation.isPending || sellMutation.isPending;

  const currentPrice = livePrice ? parseFloat(livePrice.price) : 0;
  const qty = parseFloat(quantity) || 0;
  const price = mode === 'LIMIT' ? parseFloat(limitPrice) || 0 : currentPrice;
  const total = qty * price;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!qty || qty <= 0) { setErrorMsg('Enter a valid quantity.'); return; }
    if (mode === 'LIMIT' && !parseFloat(limitPrice)) {
      setErrorMsg('Enter a limit price.');
      return;
    }

    const body = {
      coinId,
      quantity: qty,
      mode,
      ...(mode === 'LIMIT' ? { limitPrice: parseFloat(limitPrice) } : {}),
    };

    const mutation = side === 'BUY' ? buyMutation : sellMutation;
    mutation.mutate(body, {
      onSuccess: (data) => {
        setSuccessMsg(
          `${side} order ${data.status === 'EXECUTED' ? 'executed' : 'placed'} — ${data.quantity} ${symbol}`
        );
        setQuantity('');
        setLimitPrice('');
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { data?: string } } })
          ?.response?.data?.data ?? 'Order failed. Check your balance.';
        setErrorMsg(msg);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* BUY / SELL tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted/50">
        {(['BUY', 'SELL'] as OrderSide[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setSide(s); setErrorMsg(''); setSuccessMsg(''); }}
            className={cn(
              'h-8 rounded-md text-sm font-medium transition-all',
              side === s
                ? s === 'BUY'
                  ? 'bg-trade-green text-black shadow-sm'
                  : 'bg-trade-red text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* MARKET / LIMIT toggle */}
      <div className="flex gap-2">
        {(['MARKET', 'LIMIT'] as OrderMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'px-3 h-7 rounded-md text-xs font-medium transition-colors',
              mode === m
                ? 'bg-primary/15 text-primary border border-primary/25'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Wallet balance */}
      {wallet && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Available</span>
          <span className="font-mono text-foreground">
            ${parseFloat(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
          </span>
        </div>
      )}

      {/* Limit price (only for LIMIT) */}
      {mode === 'LIMIT' && (
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Limit price (USDT)</label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder={currentPrice ? currentPrice.toFixed(2) : '0.00'}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className={inputCls}
          />
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Quantity ({symbol})</label>
        <input
          type="number"
          min="0.00000001"
          step="any"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Total estimate */}
      <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">
          {mode === 'MARKET' ? 'Est. Total' : 'Total (at limit)'}
        </span>
        <span className="text-sm font-mono font-medium text-foreground">
          ${total > 0 ? total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
        </span>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1 shrink-0" />
          <p className="text-xs text-destructive">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-trade-green/25 bg-trade-green/8 px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-trade-green mt-1 shrink-0" />
          <p className="text-xs text-trade-green">{successMsg}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
          side === 'BUY'
            ? 'bg-trade-green text-black hover:bg-trade-green/85'
            : 'bg-trade-red text-white hover:bg-trade-red/85'
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          `${side} ${symbol}`
        )}
      </button>
    </form>
  );
}