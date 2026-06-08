'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useKlines } from '@/hooks/queries/useCoins';
import { useKlineStream } from '@/hooks/realtime/useKlineStream';
import type { KlineInterval } from '@/types/coin.types';

interface TradingChartProps {
  coinId: string;
  interval: KlineInterval;
}

const CHART_COLORS = {
  bg: 'transparent',
  text: '#94a3b8',
  grid: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  up: '#22c55e',
  down: '#ef4444',
};

export default function TradingChart({ coinId, interval }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const { data: klines } = useKlines(coinId, interval, 200);

  const toBar = useCallback((k: {
    openTime: number; open: string; high: string; low: string; close: string;
  }): CandlestickData => ({
    time: (k.openTime / 1000) as UTCTimestamp,
    open: parseFloat(k.open),
    high: parseFloat(k.high),
    low: parseFloat(k.low),
    close: parseFloat(k.close),
  }), []);

  // Init chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: CHART_COLORS.bg },
        textColor: CHART_COLORS.text,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: CHART_COLORS.grid },
        horzLines: { color: CHART_COLORS.grid },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: CHART_COLORS.border,
        textColor: CHART_COLORS.text,
      },
      timeScale: {
        borderColor: CHART_COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: 440,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.up,
      downColor: CHART_COLORS.down,
      borderUpColor: CHART_COLORS.up,
      borderDownColor: CHART_COLORS.down,
      wickUpColor: CHART_COLORS.up,
      wickDownColor: CHART_COLORS.down,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Responsive resize
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Load historical klines
  useEffect(() => {
    if (!seriesRef.current || !klines?.length) return;
    seriesRef.current.setData(klines.map(toBar));
    chartRef.current?.timeScale().fitContent();
  }, [klines, toBar]);

  // Realtime kline updates via WebSocket
  useKlineStream(coinId, interval, (kline) => {
    if (!seriesRef.current) return;
    seriesRef.current.update(toBar(kline));
  });

  return <div ref={containerRef} className="w-full" />;
}