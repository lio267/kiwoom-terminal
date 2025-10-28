'use client';

import { Timeframe } from "@/lib/types";
import { create } from "zustand";

interface UIState {
  symbol: string;
  timeframe: Timeframe;
  setSymbol: (value: string) => void;
  setTimeframe: (value: Timeframe) => void;
}

const DEFAULT_SYMBOL = "005930";
const DEFAULT_TIMEFRAME: Timeframe = "D";

export const useUIStore = create<UIState>((set) => ({
  symbol: DEFAULT_SYMBOL,
  timeframe: DEFAULT_TIMEFRAME,
  setSymbol: (value) =>
    set({
      symbol: value.trim().toUpperCase() || DEFAULT_SYMBOL,
    }),
  setTimeframe: (value) => set({ timeframe: value }),
}));
