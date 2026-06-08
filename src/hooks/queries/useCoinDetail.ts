// useCoinDetail.ts
import { useQuery } from '@tanstack/react-query';
import { coinsApi } from '@/lib/api/coins.api';
import { coinKeys } from './useCoins';

export function useCoinDetail(coinId: string) {
  return useQuery({
    queryKey: coinKeys.detail(coinId),
    queryFn: () => coinsApi.detail(coinId).then((r) => r.data),
    enabled: !!coinId,
    staleTime: 60_000,
  });
}