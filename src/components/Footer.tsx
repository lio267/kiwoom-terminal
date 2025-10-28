'use client';

import { useChartDataStore } from "@/store/useChartDataStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function Footer() {
  const lastUpdated = useChartDataStore((state) => state.lastUpdated);
  const error = useChartDataStore((state) => state.error);
  const connected = useAuthStore((state) => state.connected);

  return (
    <footer className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-4 text-xs text-slate-500 shadow-inner md:flex-row md:items-center md:justify-between">
      <div>
        API 연결 상태:{" "}
        <span
          className={`font-semibold ${
            connected ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {connected ? "정상" : "오프라인"}
        </span>
      </div>
      <div>마지막 갱신: {lastUpdated ?? "-"}</div>
      <div className="font-semibold text-rose-600">
        {error ? `오류: ${error}` : null}
      </div>
    </footer>
  );
}
