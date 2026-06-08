'use client';

import { useEffect, useRef } from 'react';
import { type StompSubscription } from '@stomp/stompjs';
import { ensureConnected, subscribe } from '@/lib/websocket/stomp.client';

export function useWebSocketSubscription(
  topic: string,
  onMessage: (body: unknown) => void,
  enabled = true
): void {
  const subRef = useRef<StompSubscription | null>(null);
  const onMessageRef = useRef(onMessage);

useEffect(() => {
    onMessageRef.current = onMessage;
}, [onMessage]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let cancelled = false;

    ensureConnected(() => {
      if (cancelled) return;
      subRef.current = subscribe(topic, (body) => onMessageRef.current(body));
    });

    return () => {
      cancelled = true;
      subRef.current?.unsubscribe();
      subRef.current = null;
    };
  }, [topic, enabled]);
}