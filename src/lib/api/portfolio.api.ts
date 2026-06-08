import { apiClient } from './client';
import type { ApiEnvelope } from '@/types/api.types';
import type { Portfolio } from '@/types/portfolio.types';

export const portfolioApi = {
  get: () =>
    apiClient.get<ApiEnvelope<Portfolio>>('/portfolio').then((r) => r.data),
};