import { apiClient } from './client';
import type { ApiEnvelope } from '@/types/api.types';
import type { Wallet, WalletTransaction } from '@/types/wallet.types';

export const walletApi = {
  get: () =>
    apiClient.get<ApiEnvelope<Wallet>>('/wallet').then((r) => r.data),

  deposit: (amount: number) =>
    apiClient
      .post<ApiEnvelope<Wallet>>('/wallet/deposit', null, { params: { amount } })
      .then((r) => r.data),

  withdraw: (amount: number) =>
    apiClient
      .post<ApiEnvelope<Wallet>>('/wallet/withdraw', null, { params: { amount } })
      .then((r) => r.data),

  transactions: () =>
    apiClient.get<ApiEnvelope<WalletTransaction[]>>('/wallet/transactions').then((r) => r.data),
};