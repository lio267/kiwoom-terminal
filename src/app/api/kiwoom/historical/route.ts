import { fetchHistoricalCandles } from "@/lib/kiwoom";
import { Timeframe } from "@/lib/types";
import { NextResponse } from "next/server";

const DEFAULT_SYMBOL = "005930";
const DEFAULT_TIMEFRAME: Timeframe = "D";

const isValidTimeframe = (value: string | null): value is Timeframe => {
  if (!value) return false;
  return ["D", "W", "M", "60", "30", "15", "5", "1"].includes(value);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim() || DEFAULT_SYMBOL;
  const rawTimeframe = searchParams.get("timeframe");
  const timeframe = isValidTimeframe(rawTimeframe)
    ? rawTimeframe
    : DEFAULT_TIMEFRAME;

  try {
    const candles = await fetchHistoricalCandles(symbol, timeframe);

    return NextResponse.json({
      symbol,
      timeframe,
      candles,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        symbol,
        timeframe,
        error: message,
      },
      { status: 500 },
    );
  }
}
