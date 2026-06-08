import type { CoinSummary } from './coin.types';

export interface PortfolioItem {
  itemId: number;
  coin: CoinSummary;
  quantity: string;
  avgBuyPrice: string;
  currentPrice: string;
  currentValue: string;
  pnl: string;
  pnlPercentage: string;
  isProfitable: boolean;
}

export interface Portfolio {
  totalValue: string;
  totalCost: string;
  totalPnl: string;
  totalPnlPercentage: string;
  updatedAt: number;
  items: PortfolioItem[];
}