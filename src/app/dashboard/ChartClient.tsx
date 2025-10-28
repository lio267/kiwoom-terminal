'use client';

import { useHistoricalData, useRealtimeQuote } from "@/hooks/useKiwoomData";

export default function ChartClient() {
  useHistoricalData();
  useRealtimeQuote();

  return null;
}
