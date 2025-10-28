import { Candle, Quote, Timeframe } from "@/lib/types";

const mockCandles: Record<Timeframe, Candle[]> = {
  D: [
    { time: "2025-02-03", open: 71200, high: 73100, low: 70800, close: 72800, volume: 1254300 },
    { time: "2025-02-04", open: 72800, high: 73500, low: 72100, close: 73200, volume: 1182200 },
    { time: "2025-02-05", open: 73200, high: 74400, low: 73000, close: 74150, volume: 1498300 },
    { time: "2025-02-06", open: 74150, high: 75200, low: 73900, close: 74800, volume: 1375400 },
    { time: "2025-02-07", open: 74800, high: 75800, low: 74500, close: 75600, volume: 1587600 },
  ],
  W: [
    { time: "2025-W01", open: 68900, high: 71200, low: 68300, close: 70600, volume: 5321200 },
    { time: "2025-W02", open: 70600, high: 72800, low: 70100, close: 72100, volume: 4983300 },
    { time: "2025-W03", open: 72100, high: 74400, low: 71800, close: 74050, volume: 5642800 },
  ],
  M: [
    { time: "2024-12", open: 66500, high: 70200, low: 65100, close: 69800, volume: 18923300 },
    { time: "2025-01", open: 69800, high: 74400, low: 69400, close: 74150, volume: 17655200 },
  ],
  "60": [
    { time: "2025-02-07T09:00", open: 74800, high: 75100, low: 74400, close: 74900, volume: 243000 },
    { time: "2025-02-07T10:00", open: 74900, high: 75300, low: 74200, close: 74650, volume: 220400 },
    { time: "2025-02-07T11:00", open: 74650, high: 75600, low: 74600, close: 75400, volume: 198700 },
  ],
  "30": [
    { time: "2025-02-07T09:00", open: 74800, high: 75000, low: 74500, close: 74700, volume: 143000 },
    { time: "2025-02-07T09:30", open: 74700, high: 75200, low: 74600, close: 75100, volume: 121400 },
  ],
  "15": [
    { time: "2025-02-07T09:00", open: 74800, high: 74950, low: 74500, close: 74680, volume: 83000 },
    { time: "2025-02-07T09:15", open: 74680, high: 74820, low: 74480, close: 74750, volume: 76200 },
  ],
  "5": [
    { time: "2025-02-07T09:00", open: 74800, high: 74880, low: 74650, close: 74710, volume: 45200 },
    { time: "2025-02-07T09:05", open: 74710, high: 74790, low: 74680, close: 74760, volume: 39800 },
  ],
  "1": [
    { time: "2025-02-07T09:00", open: 74800, high: 74820, low: 74760, close: 74780, volume: 12800 },
    { time: "2025-02-07T09:01", open: 74780, high: 74820, low: 74740, close: 74760, volume: 9600 },
  ],
};

const mockQuote: Quote = {
  symbol: "005930",
  name: "삼성전자",
  price: 75600,
  change: 980,
  changePercent: 1.32,
  open: 74800,
  high: 75800,
  low: 74500,
  volume: 1587600,
  updatedAt: new Date().toISOString(),
};

export function getMockCandles(timeframe: Timeframe): Candle[] {
  return mockCandles[timeframe] ?? mockCandles.D;
}

export function getMockQuote(): Quote {
  return { ...mockQuote, updatedAt: new Date().toISOString() };
}
