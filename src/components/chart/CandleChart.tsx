'use client';

import { useEffect, useMemo, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  CandlestickData,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineStyle,
  UTCTimestamp,
  createChart,
} from "lightweight-charts";
import { useChartDataStore } from "@/store/useChartDataStore";
import { useUIStore } from "@/store/useUIStore";
import { Candle } from "@/lib/types";

const chartOptions = {
  layout: {
    background: { type: ColorType.Solid, color: "#ffffff" },
    textColor: "#1f2937",
  },
  grid: {
    vertLines: { color: "#e2e8f0", style: LineStyle.Solid, visible: true },
    horzLines: { color: "#e2e8f0", style: LineStyle.Solid, visible: true },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  timeScale: {
    borderColor: "#cbd5f5",
    timeVisible: true,
    secondsVisible: false,
  },
  rightPriceScale: {
    borderColor: "#cbd5f5",
  },
};

function toUtcTimestamp(time: string): UTCTimestamp {
  if (/^\d{8}$/.test(time)) {
    const year = Number(time.slice(0, 4));
    const month = Number(time.slice(4, 6)) - 1;
    const day = Number(time.slice(6, 8));
    return Math.floor(Date.UTC(year, month, day) / 1000) as UTCTimestamp;
  }

  if (/^\d{4}-W\d{2}$/.test(time)) {
    const [yearStr, weekStr] = time.split("-W");
    const year = Number(yearStr);
    const week = Number(weekStr);
    const firstDay = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    return Math.floor(firstDay.getTime() / 1000) as UTCTimestamp;
  }

  const timestamp = Date.parse(time);
  if (!Number.isNaN(timestamp)) {
    return Math.floor(timestamp / 1000) as UTCTimestamp;
  }

  return Math.floor(Date.now() / 1000) as UTCTimestamp;
}

function mapCandles(candles: Candle[]): CandlestickData<UTCTimestamp>[] {
  return candles.map((item) => ({
    time: toUtcTimestamp(item.time),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }));
}

export default function CandleChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const candles = useChartDataStore((state) => state.candles);
  const candlesLoading = useChartDataStore((state) => state.candlesLoading);
  const timeframe = useUIStore((state) => state.timeframe);

  const chartData = useMemo(() => mapCandles(candles), [candles]);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      ...chartOptions,
      width: containerRef.current.clientWidth,
      height: 480,
    });

    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: "#0ea5e9",
      borderUpColor: "#0ea5e9",
      downColor: "#f87171",
      borderDownColor: "#f87171",
      wickUpColor: "#22d3ee",
      wickDownColor: "#fb7185",
    });

    const handleResize = () => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [chartData, timeframe]);

  return (
    <section className="flex-1 rounded-2xl bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">가격 차트</h2>
          <p className="text-xs text-slate-500">
            TradingView Lightweight Charts 기반
          </p>
        </div>
        {candlesLoading && (
          <span className="text-xs font-medium text-slate-500">
            차트 데이터를 불러오는 중…
          </span>
        )}
      </div>

      <div ref={containerRef} className="h-[480px] w-full" />

      <p className="mt-3 text-[10px] text-slate-400">
        Charting library by{" "}
        <a
          href="https://www.tradingview.com/lightweight-charts/"
          target="_blank"
          rel="noreferrer"
          className="text-sky-500 underline"
        >
          TradingView
        </a>
        .
      </p>
    </section>
  );
}
