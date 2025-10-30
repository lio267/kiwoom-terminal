import type { NextApiRequest, NextApiResponse } from "next";
import {
  fetchHistoricalCandles,
  fetchRealtimeQuote,
} from "@/lib/kiwoom";
import type { Candle, Quote, Timeframe } from "@/lib/types";

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: "nodejs",
};

type InitPayload = {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  quote?: Quote;
};

type QuotePayload = {
  symbol: string;
  timeframe: Timeframe;
  quote: Quote;
};

type CandlePayload = {
  symbol: string;
  timeframe: Timeframe;
  candle: Candle;
};

type ErrorPayload = {
  message: string;
};

const isValidTimeframe = (value: string | null | undefined): value is Timeframe =>
  Boolean(value && ["D", "W", "M", "60", "30", "15", "5", "1"].includes(value));

const sendEvent = (
  response: NextApiResponse,
  event: string,
  data: InitPayload | QuotePayload | CandlePayload | ErrorPayload,
) => {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(data)}\n\n`);
};

const sendHeartbeat = (response: NextApiResponse) => {
  response.write(": heartbeat\n\n");
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== "GET") {
    response.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const rawSymbol = (request.query.symbol as string | undefined)?.trim();
  const rawTimeframe = (request.query.timeframe as string | undefined)?.trim();

  const symbol = rawSymbol?.toUpperCase() || "005930";
  const timeframe = isValidTimeframe(rawTimeframe) ? rawTimeframe : "D";

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders?.();

  console.info(
    `[KiwoomStream] SSE stream opened symbol=${symbol} timeframe=${timeframe}`,
  );

  let closed = false;

  const sendError = (message: string) => {
    sendEvent(response, "server-error", { message });
  };

  try {
    const [candles, quote] = await Promise.all([
      fetchHistoricalCandles(symbol, timeframe),
      fetchRealtimeQuote(symbol).catch(() => undefined),
    ]);

    sendEvent(response, "init", {
      symbol,
      timeframe,
      candles,
      quote,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "초기 데이터를 불러오지 못했습니다.";
    sendError(message);
  }

  const quoteTimer = setInterval(async () => {
    try {
      const quote = await fetchRealtimeQuote(symbol);
      sendEvent(response, "quote", {
        symbol,
        timeframe,
        quote,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "실시간 시세를 불러오지 못했습니다.";
      sendError(message);
    }
  }, 15_000);

  const candleTimer = setInterval(async () => {
    try {
      const candles = await fetchHistoricalCandles(symbol, timeframe);
      if (candles.length > 0) {
        const latest = candles[candles.length - 1];
        sendEvent(response, "candle", {
          symbol,
          timeframe,
          candle: latest,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "차트 데이터를 갱신하지 못했습니다.";
      sendError(message);
    }
  }, 60_000);

  const aliveTimer = setInterval(() => {
    sendHeartbeat(response);
  }, 25_000);

  const cleanup = () => {
    if (closed) return;
    closed = true;
    clearInterval(quoteTimer);
    clearInterval(candleTimer);
    clearInterval(aliveTimer);
    console.info(
      `[KiwoomStream] SSE stream closed symbol=${symbol} timeframe=${timeframe}`,
    );
    response.end();
  };

  request.on("close", cleanup);
  request.on("error", cleanup);
}
