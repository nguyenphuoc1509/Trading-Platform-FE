import { apiClient } from './client';
import type { ApiEnvelope } from '@/types/api.types';
import type { CoinSummary, Kline, KlineInterval } from '@/types/coin.types';

export const coinsApi = {
  list: (page = 1) =>
    apiClient.get<ApiEnvelope<CoinSummary[]>>('/coins', { params: { page } }).then((r) => r.data),

  detail: (coinId: string) =>
    apiClient.get<ApiEnvelope<string>>(`/coins/${coinId}`).then((r) => r.data),

  klines: (coinId: string, interval: KlineInterval = '1h', limit = 100) =>
    apiClient
      .get<ApiEnvelope<Kline[]>>(`/coins/${coinId}/klines`, { params: { interval, limit } })
      .then((r) => r.data),

  chart: (coinId: string, days = 7) =>
    apiClient.get<ApiEnvelope<string>>(`/coins/${coinId}/chart`, { params: { days } }).then((r) => r.data),

  search: (keyword: string) =>
    apiClient.get<ApiEnvelope<string>>('/coins/search', { params: { keyword } }).then((r) => r.data),

  top50: () => apiClient.get<ApiEnvelope<string>>('/coins/top50').then((r) => r.data),

  trending: () => apiClient.get<ApiEnvelope<string>>('/coins/trending').then((r) => r.data),
};