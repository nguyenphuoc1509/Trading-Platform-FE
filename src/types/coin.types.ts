export interface CoinSummary {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: string;
  priceChange24h: string;
  marketCapRank: number;
}

export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export type KlineInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

export const KLINE_INTERVALS: { label: string; value: KlineInterval }[] = [
  { label: '1m',  value: '1m' },
  { label: '5m',  value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h',  value: '1h' },
  { label: '4h',  value: '4h' },
  { label: '1D',  value: '1d' },
  { label: '1W',  value: '1w' },
];