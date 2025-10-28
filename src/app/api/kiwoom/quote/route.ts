import { fetchRealtimeQuote } from "@/lib/kiwoom";
import { NextResponse } from "next/server";

const DEFAULT_SYMBOL = "005930";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim() || DEFAULT_SYMBOL;

  try {
    const quote = await fetchRealtimeQuote(symbol);

    return NextResponse.json({
      symbol,
      quote,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        symbol,
        error: message,
      },
      { status: 500 },
    );
  }
}
