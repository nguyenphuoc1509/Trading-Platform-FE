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
  bg: '#0f172a',
  text: '#94a3b8',
  grid: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  up: '#22c55e',
  down: '#ef4444',
};

export default function TradingChart({
  coinId,
  interval,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const { data: klines } = useKlines(coinId, interval, 200);

  const toBar = useCallback(
    (k: {
      openTime: number;
      open: string;
      high: string;
      low: string;
      close: string;
    }): CandlestickData => ({
      time: Math.floor(k.openTime / 1000) as UTCTimestamp,
      open: Number(k.open),
      high: Number(k.high),
      low: Number(k.low),
      close: Number(k.close),
    }),
    []
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      console.log('Container not found');
      return;
    }

    const width = container.clientWidth || 800;

    console.log('Chart width:', width);

    const chart = createChart(container, {
      width,
      height: 440,
      layout: {
        background: {
          color: CHART_COLORS.bg,
        },
        textColor: CHART_COLORS.text,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: {
          color: CHART_COLORS.grid,
        },
        horzLines: {
          color: CHART_COLORS.grid,
        },
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.border,
      },
      timeScale: {
        borderColor: CHART_COLORS.border,
        timeVisible: true,
      },
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

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;

      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;

    console.log('Klines:', klines);

    if (!Array.isArray(klines)) {
      console.log('Klines is not array');
      return;
    }

    if (klines.length === 0) {
      console.log('No kline data');
      return;
    }

    const bars = klines.map(toBar);

    console.log('Bars:', bars[0]);

    seriesRef.current.setData(bars);
    chartRef.current?.timeScale().fitContent();
  }, [klines, toBar]);

  useKlineStream(coinId, interval, (kline) => {
    if (!seriesRef.current) return;

    seriesRef.current.update(toBar(kline));
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-[440px]"
    />
  );
}