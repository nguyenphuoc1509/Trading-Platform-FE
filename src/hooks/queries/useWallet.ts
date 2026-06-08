import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/lib/api/wallet.api';

export const walletKeys = {
  all: ['wallet'] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
};

export function useWallet() {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: () => walletApi.get().then((r) => r.data),
    staleTime: 10_000,
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: walletKeys.transactions(),
    queryFn: () => walletApi.transactions().then((r) => r.data),
    staleTime: 15_000,
  });
}