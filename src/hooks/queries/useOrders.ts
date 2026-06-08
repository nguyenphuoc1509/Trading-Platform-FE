import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders.api';

export const orderKeys = {
  all: ['orders'] as const,
  history: () => [...orderKeys.all, 'history'] as const,
  pending: () => [...orderKeys.all, 'pending'] as const,
};

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.history(),
    queryFn: () => ordersApi.history().then((r) => r.data),
    staleTime: 10_000,
  });
}

export function usePendingOrders() {
  return useQuery({
    queryKey: orderKeys.pending(),
    queryFn: () => ordersApi.pending().then((r) => r.data),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}