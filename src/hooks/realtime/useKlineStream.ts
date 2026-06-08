'use client';

import { useWebSocketSubscription } from './useWebsocket';
import type { KlineInterval } from '@/types/coin.types';

export interface KlineMessage {
  type: string;
  coinId: string;
  symbol: string;
  interval: string;
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closed: boolean;
  timestamp: number;
}

export function useKlineStream(
  coinId: string,
  interval: KlineInterval,
  onUpdate: (kline: KlineMessage) => void,
  enabled = true
): void {
  useWebSocketSubscription(
    `/topic/klines/${coinId}/${interval}`,
    (data) => onUpdate(data as KlineMessage),
    enabled
  );
}