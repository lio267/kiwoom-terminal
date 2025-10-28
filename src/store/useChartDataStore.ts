'use client';

import { Candle, Quote } from "@/lib/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ChartDataState {
  candles: Candle[];
  quote?: Quote;
  candlesLoading: boolean;
  quoteLoading: boolean;
  error?: string;
  lastUpdated?: string;
  setCandles: (candles: Candle[]) => void;
  setQuote: (quote: Quote) => void;
  setCandlesLoading: (value: boolean) => void;
  setQuoteLoading: (value: boolean) => void;
  setError: (message?: string) => void;
}

export const useChartDataStore = create<ChartDataState>()(
  devtools(
    (set) => ({
      candles: [],
      quote: undefined,
      candlesLoading: false,
      quoteLoading: false,
      error: undefined,
      lastUpdated: undefined,
      setCandles: (candles) =>
        set({
          candles,
          candlesLoading: false,
          lastUpdated: new Date().toISOString(),
        }),
      setQuote: (quote) =>
        set({
          quote,
          quoteLoading: false,
          lastUpdated: new Date().toISOString(),
        }),
      setCandlesLoading: (value) => set({ candlesLoading: value }),
      setQuoteLoading: (value) => set({ quoteLoading: value }),
      setError: (message) => set({ error: message }),
    }),
    {
      name: "chart-data-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);
