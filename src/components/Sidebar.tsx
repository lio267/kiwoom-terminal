'use client';

import { useChartDataStore } from "@/store/useChartDataStore";
import { useUIStore } from "@/store/useUIStore";
import { format } from "date-fns";

function formatCurrency(value?: number) {
  if (value === undefined) return "-";
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatPercent(value?: number) {
  if (value === undefined) return "-";
  return `${value.toFixed(2)}%`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return format(new Date(value), "yyyy-MM-dd HH:mm:ss");
}

export default function Sidebar() {
  const symbol = useUIStore((state) => state.symbol);
  const quote = useChartDataStore((state) => state.quote);
  const quoteLoading = useChartDataStore((state) => state.quoteLoading);

  const changeClass =
    (quote?.change ?? 0) > 0
      ? "text-emerald-600"
      : (quote?.change ?? 0) < 0
        ? "text-rose-600"
        : "text-slate-600";

  return (
    <aside className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-md md:w-80">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {quote?.name ?? "종목 정보"}
        </h2>
        <p className="text-sm text-slate-500">종목코드: {symbol}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            현재가
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(quote?.price)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            전일 대비
          </p>
          <p className={`mt-1 text-lg font-semibold ${changeClass}`}>
            {quote?.change !== undefined
              ? formatCurrency(quote.change)
              : "-"}
          </p>
          <p className={`text-xs font-medium ${changeClass}`}>
            {quote?.changePercent !== undefined
              ? formatPercent(quote.changePercent)
              : "-"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">고가</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {formatCurrency(quote?.high)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">저가</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {formatCurrency(quote?.low)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            거래량
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {formatCurrency(quote?.volume)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            시가
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {formatCurrency(quote?.open)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>데이터 갱신</span>
          <span>{formatDate(quote?.updatedAt)}</span>
        </div>
        <div className="mt-2">
          상태:{" "}
          <span className="font-semibold text-slate-700">
            {quoteLoading ? "불러오는 중…" : "실시간"}
          </span>
        </div>
      </div>
    </aside>
  );
}
