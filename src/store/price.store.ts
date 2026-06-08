import { create } from 'zustand';

export interface LivePrice {
  coinId: string;
  symbol: string;
  name: string;
  price: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  change24h: string;
  timestamp: number;
}

interface PriceState {
  prices: Record<string, LivePrice>;
  updatePrice: (data: LivePrice) => void;
  getPrice: (coinId: string) => LivePrice | undefined;
}

export const usePriceStore = create<PriceState>((set, get) => ({
  prices: {},
  updatePrice: (data) =>
    set((s) => ({ prices: { ...s.prices, [data.coinId]: data } })),
  getPrice: (coinId) => get().prices[coinId],
}));