'use client';

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChartDataStore } from "@/store/useChartDataStore";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Candle, Quote, Timeframe } from "@/lib/types";

interface HistoricalPayload {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  error?: string;
}

interface QuotePayload {
  symbol: string;
  quote?: Quote;
  error?: string;
}

async function requestHistorical(
  symbol: string,
  timeframe: Timeframe,
): Promise<HistoricalPayload> {
  const url = `/api/kiwoom/historical?symbol=${symbol}&timeframe=${timeframe}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const payload = (await response.json()) as HistoricalPayload;
    throw new Error(payload.error ?? "히스토리컬 데이터 요청 실패");
  }

  return (await response.json()) as HistoricalPayload;
}

async function requestQuote(symbol: string): Promise<Quote> {
  const url = `/api/kiwoom/quote?symbol=${symbol}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const payload = (await response.json()) as QuotePayload;
    throw new Error(payload.error ?? "실시간 시세 요청 실패");
  }

  const payload = (await response.json()) as QuotePayload;

  if (!payload.quote) {
    throw new Error("응답에 시세 데이터가 없습니다.");
  }

  return payload.quote;
}

export function useHistoricalData() {
  const symbol = useUIStore((state) => state.symbol);
  const timeframe = useUIStore((state) => state.timeframe);
  const setCandles = useChartDataStore((state) => state.setCandles);
  const setCandlesLoading = useChartDataStore(
    (state) => state.setCandlesLoading,
  );
  const setError = useChartDataStore((state) => state.setError);
  const setLastError = useAuthStore((state) => state.setLastError);

  const query = useQuery({
    queryKey: ["historical", symbol, timeframe],
    queryFn: () => requestHistorical(symbol, timeframe),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  useEffect(() => {
    setCandlesLoading(query.isFetching);
  }, [query.isFetching, setCandlesLoading]);

  useEffect(() => {
    if (query.data?.candles) {
      setCandles(query.data.candles);
      setError(undefined);
      setLastError(undefined);
    }
  }, [query.data?.candles, setCandles, setError, setLastError]);

  useEffect(() => {
    if (query.error) {
      setError(query.error.message);
      setLastError(query.error.message);
    }
  }, [query.error, setError, setLastError]);

  return query;
}

export function useRealtimeQuote() {
  const symbol = useUIStore((state) => state.symbol);
  const setQuote = useChartDataStore((state) => state.setQuote);
  const setQuoteLoading = useChartDataStore((state) => state.setQuoteLoading);
  const setError = useChartDataStore((state) => state.setError);
  const setConnected = useAuthStore((state) => state.setConnected);
  const setLastError = useAuthStore((state) => state.setLastError);

  const query = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => requestQuote(symbol),
    refetchInterval: 15_000,
    staleTime: 5_000,
    retry: 1,
  });

  useEffect(() => {
    setQuoteLoading(query.isFetching);
  }, [query.isFetching, setQuoteLoading]);

  useEffect(() => {
    if (query.data) {
      setQuote(query.data);
      setConnected(true);
      setError(undefined);
      setLastError(undefined);
    }
  }, [query.data, setQuote, setConnected, setError, setLastError]);

  useEffect(() => {
    if (query.error) {
      setError(query.error.message);
      setConnected(false);
      setLastError(query.error.message);
    }
  }, [query.error, setError, setConnected, setLastError]);

  return query;
}
