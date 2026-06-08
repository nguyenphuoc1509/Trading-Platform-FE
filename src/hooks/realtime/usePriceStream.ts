'use client';

import { useWebSocketSubscription } from './useWebsocket';
import { usePriceStore, type LivePrice } from '@/store/price.store';

/**
 * Subscribe to price updates.
 * - coinId provided → `/topic/prices/{coinId}` (single coin)
 * - coinId omitted  → `/topic/prices` (all coins)
 */
export function usePriceStream(coinId?: string): void {
  const updatePrice = usePriceStore((s) => s.updatePrice);
  const topic = coinId ? `/topic/prices/${coinId}` : '/topic/prices';

  useWebSocketSubscription(topic, (data) => {
    updatePrice(data as LivePrice);
  });
}