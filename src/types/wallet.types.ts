export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BUY_ASSET' | 'SELL_ASSET';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILURE';

export interface Wallet {
  walletId: number;
  balance: string;
  currency: string;
}

export interface WalletTransaction {
  txId: number;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  purpose: string;
  createdAt: number;
}