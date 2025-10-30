'use client';

import { useEffect, useRef } from "react";
import { useUIStore } from "@/store/useUIStore";
import { useChartDataStore } from "@/store/useChartDataStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Candle, Quote } from "@/lib/types";

export function useKiwoomStream() {
  const symbol = useUIStore((state) => state.symbol);
  const timeframe = useUIStore((state) => state.timeframe);

  const setCandles = useChartDataStore((state) => state.setCandles);
  const upsertCandle = useChartDataStore((state) => state.upsertCandle);
  const setQuote = useChartDataStore((state) => state.setQuote);
  const setCandlesLoading = useChartDataStore(
    (state) => state.setCandlesLoading,
  );
  const setQuoteLoading = useChartDataStore((state) => state.setQuoteLoading);
  const setError = useChartDataStore((state) => state.setError);

  const setConnected = useAuthStore((state) => state.setConnected);
  const setLastError = useAuthStore((state) => state.setLastError);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = `/api/kiwoom/stream?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`;

    setCandlesLoading(true);
    setQuoteLoading(true);
    setError(undefined);
    setLastError(undefined);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    const handleOpen = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      setConnected(true);
    };

    const handleInit = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as {
          candles: Candle[];
          quote?: Quote;
        };

        if (Array.isArray(payload.candles)) {
          setCandles(payload.candles);
          setCandlesLoading(false);
        }

        if (payload.quote) {
          setQuote(payload.quote);
          setQuoteLoading(false);
        }

        setError(undefined);
        setLastError(undefined);
        setConnected(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "초기 데이터를 해석할 수 없습니다.";
        setError(message);
        setLastError(message);
      }
    };

    const handleQuote = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as { quote: Quote };
        if (payload.quote) {
          setQuote(payload.quote);
          setQuoteLoading(false);
          setConnected(true);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "실시간 시세를 해석할 수 없습니다.";
        setError(message);
        setLastError(message);
      }
    };

    const handleCandle = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as { candle: Candle };
        if (payload.candle) {
          upsertCandle(payload.candle);
          setCandlesLoading(false);
          setConnected(true);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "차트 데이터를 해석할 수 없습니다.";
        setError(message);
        setLastError(message);
      }
    };

    const handleServerError = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as { message?: string };
        const message =
          payload.message ?? "실시간 데이터 스트림에서 오류가 발생했습니다.";
        setError(message);
        setLastError(message);
      } catch {
        setError("실시간 데이터 스트림에서 오류가 발생했습니다.");
        setLastError("실시간 데이터 스트림에서 오류가 발생했습니다.");
      }
    };

    const handleError = () => {
      setConnected(false);
      setLastError("실시간 연결이 일시적으로 끊어졌습니다.");
      setCandlesLoading(false);
      setQuoteLoading(false);

      if (!reconnectTimerRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
          setError(undefined);
          setLastError(undefined);
        }, 3_000);
      }
    };

    eventSource.addEventListener("open", handleOpen as EventListener);
    eventSource.addEventListener("init", handleInit as EventListener);
    eventSource.addEventListener("quote", handleQuote as EventListener);
    eventSource.addEventListener("candle", handleCandle as EventListener);
    eventSource.addEventListener("server-error", handleServerError as EventListener);
    eventSource.onerror = handleError;

    return () => {
      eventSource.removeEventListener("open", handleOpen as EventListener);
      eventSource.removeEventListener("init", handleInit as EventListener);
      eventSource.removeEventListener("quote", handleQuote as EventListener);
      eventSource.removeEventListener("candle", handleCandle as EventListener);
      eventSource.removeEventListener("server-error", handleServerError as EventListener);
      eventSource.close();
      eventSourceRef.current = null;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      setConnected(false);
    };
  }, [
    symbol,
    timeframe,
    setCandles,
    upsertCandle,
    setQuote,
    setCandlesLoading,
    setQuoteLoading,
    setError,
    setConnected,
    setLastError,
  ]);
}
