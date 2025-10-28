'use client';

import { FormEvent, useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Timeframe } from "@/lib/types";

const TIMEFRAME_OPTIONS: Array<{ label: string; value: Timeframe }> = [
  { label: "일", value: "D" },
  { label: "주", value: "W" },
  { label: "월", value: "M" },
  { label: "60분", value: "60" },
  { label: "30분", value: "30" },
  { label: "15분", value: "15" },
  { label: "5분", value: "5" },
  { label: "1분", value: "1" },
];

export default function Header() {
  const symbol = useUIStore((state) => state.symbol);
  const timeframe = useUIStore((state) => state.timeframe);
  const setSymbol = useUIStore((state) => state.setSymbol);
  const setTimeframe = useUIStore((state) => state.setTimeframe);
  const connected = useAuthStore((state) => state.connected);
  const lastError = useAuthStore((state) => state.lastError);
  const [draftSymbol, setDraftSymbol] = useState(symbol);

  useEffect(() => {
    setDraftSymbol(symbol);
  }, [symbol]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSymbol(draftSymbol);
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-md">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Kiwoom Market Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          키움증권 REST API 기반 실시간 시세 및 차트
        </p>
      </div>

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={handleSubmit}
      >
        <label className="text-sm font-semibold text-slate-600" htmlFor="symbol">
          종목코드
        </label>
        <input
          id="symbol"
          value={draftSymbol}
          onChange={(event) => setDraftSymbol(event.target.value)}
          placeholder="예: 005930"
          className="h-10 w-28 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold uppercase text-slate-800 outline-none ring-offset-2 transition focus:border-slate-300 focus:ring-2 focus:ring-sky-400"
        />
        <button
          type="submit"
          className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          조회
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {TIMEFRAME_OPTIONS.map((option) => {
          const active = option.value === timeframe;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeframe(option.value)}
              className={`h-9 rounded-full border px-4 text-sm font-medium transition ${
                active
                  ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-400 hover:text-sky-600"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full ${
            connected ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />
        <span className="text-slate-600">
          {connected ? "API 연결 정상" : "API 연결 대기 중"}
        </span>
        {lastError && (
          <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">
            {lastError}
          </span>
        )}
      </div>
    </header>
  );
}
