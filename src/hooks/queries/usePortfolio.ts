import { useQuery } from '@tanstack/react-query';
import { portfolioApi } from '@/lib/api/portfolio.api';

export const portfolioKeys = {
  all: ['portfolio'] as const,
  detail: () => [...portfolioKeys.all, 'detail'] as const,
};

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioKeys.detail(),
    queryFn: () => portfolioApi.get().then((r) => r.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}