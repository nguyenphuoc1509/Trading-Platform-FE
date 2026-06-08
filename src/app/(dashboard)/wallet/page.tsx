'use client';

import { useState } from 'react';
import { Loader2, ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from 'lucide-react';
import { useWallet, useWalletTransactions } from '@/hooks/queries/useWallet';
import { useDeposit } from '@/hooks/mutations/useDeposit';
import { useWithdraw } from '@/hooks/mutations/useWidthraw';
import { cn } from '@/lib/utils';
import type { TransactionType, TransactionStatus } from '@/types/wallet.types';

type Tab = 'DEPOSIT' | 'WITHDRAW';

const inputCls =
  'w-full h-10 rounded-lg border border-border bg-input/30 px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all';

const TX_TYPE_LABEL: Record<TransactionType, string> = {
  DEPOSIT:    'Deposit',
  WITHDRAWAL: 'Withdrawal',
  BUY_ASSET:  'Buy',
  SELL_ASSET: 'Sell',
};

const TX_TYPE_COLOR: Record<TransactionType, string> = {
  DEPOSIT:    'text-trade-green',
  WITHDRAWAL: 'text-trade-red',
  BUY_ASSET:  'text-trade-red',
  SELL_ASSET: 'text-trade-green',
};

const TX_STATUS_STYLE: Record<TransactionStatus, string> = {
  SUCCESS: 'text-trade-green bg-trade-green/10 border-trade-green/20',
  PENDING: 'text-trade-gold  bg-trade-gold/10  border-trade-gold/20',
  FAILURE: 'text-destructive bg-destructive/10 border-destructive/20',
};

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

function fmt(v: string | number) {
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: txs, isLoading: txLoading } = useWalletTransactions();

  const depositMutation = useDeposit();
  const withdrawMutation = useWithdraw();
  const isPending = depositMutation.isPending || withdrawMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) { setErrorMsg('Enter a valid amount.'); return; }

    setErrorMsg('');
    setSuccessMsg('');

    const mutation = tab === 'DEPOSIT' ? depositMutation : withdrawMutation;
    mutation.mutate(num, {
      onSuccess: (data) => {
        setSuccessMsg(
          tab === 'DEPOSIT'
            ? `$${fmt(num)} deposited. New balance: $${fmt(data.balance)}`
            : `$${fmt(num)} withdrawn. New balance: $${fmt(data.balance)}`
        );
        setAmount('');
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { data?: string } } })
          ?.response?.data?.data ?? 'Transaction failed.';
        setErrorMsg(msg);
      },
    });
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-xl font-semibold text-foreground">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your USDT balance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left: balance + form */}
        <div className="space-y-4">
          {/* Balance card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-mono font-semibold text-foreground">
                  {walletLoading ? '—' : `$${fmt(wallet?.balance ?? 0)}`}
                </p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground font-mono border border-border rounded-md px-2 py-1">
                {wallet?.currency ?? 'USDT'}
              </span>
            </div>
          </div>

          {/* Deposit / Withdraw form */}
          <div className="rounded-xl border border-border bg-card p-5">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted/40 mb-5">
              {(['DEPOSIT', 'WITHDRAW'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setErrorMsg(''); setSuccessMsg(''); setAmount(''); }}
                  className={cn(
                    'h-8 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                    tab === t
                      ? 'bg-background text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'DEPOSIT'
                    ? <ArrowDownLeft className="w-3.5 h-3.5 text-trade-green" />
                    : <ArrowUpRight className="w-3.5 h-3.5 text-trade-red" />
                  }
                  {t === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Amount (USDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setErrorMsg(''); setSuccessMsg(''); }}
                    className={cn(inputCls, 'pl-7')}
                  />
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(String(a))}
                    className={cn(
                      'px-3 h-7 rounded-md text-xs font-mono font-medium border transition-colors',
                      amount === String(a)
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-border/60'
                    )}
                  >
                    ${a.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Messages */}
              {errorMsg && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1 shrink-0" />
                  <p className="text-xs text-destructive">{errorMsg}</p>
                </div>
              )}
              {successMsg && (
                <div className="flex items-start gap-2 rounded-lg border border-trade-green/25 bg-trade-green/8 px-3 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-trade-green mt-1 shrink-0" />
                  <p className="text-xs text-trade-green">{successMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  'w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
                  tab === 'DEPOSIT'
                    ? 'bg-trade-green text-black hover:bg-trade-green/85'
                    : 'bg-trade-red text-white hover:bg-trade-red/85'
                )}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {tab === 'DEPOSIT'
                      ? <ArrowDownLeft className="w-4 h-4" />
                      : <ArrowUpRight className="w-4 h-4" />
                    }
                    {tab === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: transaction history */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Transaction History</h2>
          </div>

          {txLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : !txs?.length ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[520px] overflow-auto">
              {txs.map((tx) => (
                <div key={tx.txId} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      ['DEPOSIT','SELL_ASSET'].includes(tx.type) ? 'bg-trade-green/10' : 'bg-trade-red/10'
                    )}>
                      {['DEPOSIT','SELL_ASSET'].includes(tx.type)
                        ? <ArrowDownLeft className="w-3.5 h-3.5 text-trade-green" />
                        : <ArrowUpRight className="w-3.5 h-3.5 text-trade-red" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {TX_TYPE_LABEL[tx.type]}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.purpose}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-mono font-medium', TX_TYPE_COLOR[tx.type])}>
                      {['DEPOSIT','SELL_ASSET'].includes(tx.type) ? '+' : '-'}${fmt(tx.amount)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className={cn('text-[10px] font-medium border rounded-full px-1.5 py-px', TX_STATUS_STYLE[tx.status])}>
                        {tx.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}