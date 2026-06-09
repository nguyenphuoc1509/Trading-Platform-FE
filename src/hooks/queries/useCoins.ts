import { useQuery } from '@tanstack/react-query';
import { coinsApi } from '@/lib/api/coins.api';
import type { KlineInterval } from '@/types/coin.types';

export const coinKeys = {
  all: ['coins'] as const,
  list: (page: number) => [...coinKeys.all, 'list', page] as const,
  detail: (id: string) => [...coinKeys.all, 'detail', id] as const,
  klines: (id: string, interval: string) => [...coinKeys.all, 'klines', id, interval] as const,
};

export function useCoins(page = 1) {
  return useQuery({
    queryKey: coinKeys.list(page),
    queryFn: () => coinsApi.list(page).then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useKlines(
  coinId: string,
  interval: KlineInterval = '1h',
  limit = 200
) {
  return useQuery({
    queryKey: coinKeys.klines(coinId, interval),
    queryFn: async () => {
      const response = await coinsApi.klines(
        coinId,
        interval,
        limit
      );

      console.log('API RESPONSE', response);
      console.log('API DATA', response.data);

      return response.data;
    },
    staleTime: Infinity,
    enabled: !!coinId,
  });
}