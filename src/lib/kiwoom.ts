import { getMockCandles, getMockQuote } from "@/lib/mockData";
import {
  Candle,
  KiwoomErrorResponse,
  KiwoomTokenResponse,
  Quote,
  Timeframe,
} from "@/lib/types";

const KIWOOM_BASE_URL = process.env.KIWOOM_BASE_URL;
const KIWOOM_APP_KEY =
  process.env.KIWOOM_APP_KEY ?? process.env.KIWOOM_CLIENT_ID ?? "";
const KIWOOM_APP_SECRET =
  process.env.KIWOOM_APP_SECRET ?? process.env.KIWOOM_CLIENT_SECRET ?? "";
const KIWOOM_CUSTOMER_TYPE = process.env.KIWOOM_CUSTOMER_TYPE ?? "P";

const MOCK_MODE = process.env.MOCK_MODE === "true";

const HISTORICAL_TR_ID =
  process.env.KIWOOM_TR_ID_HISTORICAL ?? "FHKST03010100";
const QUOTE_TR_ID = process.env.KIWOOM_TR_ID_QUOTE ?? "FHKST01010100";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

type TokenCache = {
  token: string;
  expiresAt: number;
};

const tokenCache: TokenCache = {
  token: "",
  expiresAt: 0,
};

const isDailyFrame = (frame: Timeframe) =>
  frame === "D" || frame === "W" || frame === "M";

const timeframeParams: Record<
  Timeframe,
  { fidPeriod: string; fidHours?: string }
> = {
  D: { fidPeriod: "D" },
  W: { fidPeriod: "W" },
  M: { fidPeriod: "M" },
  "60": { fidPeriod: "H", fidHours: "60" },
  "30": { fidPeriod: "H", fidHours: "30" },
  "15": { fidPeriod: "H", fidHours: "15" },
  "5": { fidPeriod: "H", fidHours: "5" },
  "1": { fidPeriod: "H", fidHours: "1" },
};

function assertServerEnv() {
  if (MOCK_MODE) return;

  if (!KIWOOM_BASE_URL || !KIWOOM_APP_KEY || !KIWOOM_APP_SECRET) {
    throw new Error(
      "Kiwoom API 환경 변수가 누락되었습니다. .env.local 파일을 확인하세요.",
    );
  }
}

function toNumber(value: string | number | undefined) {
  if (value === undefined) return 0;
  if (typeof value === "number") return value;
  const sanitized = value.replace(/,/g, "");
  const parsed = Number(sanitized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function requestKiwoomToken(): Promise<TokenCache> {
  assertServerEnv();

  if (MOCK_MODE) {
    return {
      token: "mock-token",
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
  }

  if (tokenCache.token && tokenCache.expiresAt > Date.now() + 10_000) {
    return tokenCache;
  }

  const tokenUrl = `${KIWOOM_BASE_URL}/oauth2/tokenP`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    appkey: KIWOOM_APP_KEY,
    appsecret: KIWOOM_APP_SECRET,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const error = (await response.json()) as KiwoomErrorResponse;
    throw new Error(
      `토큰 발급 실패 (${response.status}): ${error?.message ?? "Unknown error"}`,
    );
  }

  const payload = (await response.json()) as KiwoomTokenResponse;
  const expiresIn = Number(payload.expires_in) * 1000;

  tokenCache.token = payload.access_token;
  tokenCache.expiresAt = Date.now() + expiresIn;

  return tokenCache;
}

async function callKiwoom<T>(
  endpoint: string,
  params: URLSearchParams,
  trId: string,
): Promise<T> {
  assertServerEnv();

  if (MOCK_MODE) {
    throw new Error("Mock 모드에서는 callKiwoom이 사용되지 않습니다.");
  }

  const { token } = await requestKiwoomToken();
  const url = `${KIWOOM_BASE_URL}${endpoint}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      appkey: KIWOOM_APP_KEY,
      appsecret: KIWOOM_APP_SECRET,
      tr_id: trId,
      custtype: KIWOOM_CUSTOMER_TYPE,
      "Content-Type": "application/json; charset=utf-8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Kiwoom API 호출 실패 (${response.status}): ${text || response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export async function fetchHistoricalCandles(
  symbol: string,
  timeframe: Timeframe,
): Promise<Candle[]> {
  if (!symbol) {
    throw new Error("종목 코드를 입력하세요.");
  }

  if (MOCK_MODE || !KIWOOM_BASE_URL) {
    return getMockCandles(timeframe);
  }

  const params = new URLSearchParams({
    fid_cond_mrkt_div_code: "J",
    fid_input_iscd: symbol,
    fid_org_adj_prc: "0",
  });

  const frame = timeframeParams[timeframe] ?? timeframeParams.D;
  let endpoint =
    "/uapi/domestic-stock/v1/quotations/inquire-daily-chartprice";

  if (!isDailyFrame(timeframe)) {
    endpoint =
      "/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice";
    params.set("fid_period_div_code", frame.fidPeriod);
    if (frame.fidHours) {
      params.set("fid_input_hour_24", frame.fidHours);
    }
    params.set("fid_input_date_1", "0");
  } else {
    params.set("fid_period_div_code", frame.fidPeriod);
    params.set("fid_input_date_1", "0");
    params.set("fid_input_date_2", "0");
  }

  type HistoricalResponse = {
    output2?: Array<{
      stck_bsop_date?: string;
      stck_cntg_hour?: string;
      stck_oprc?: string;
      stck_clpr?: string;
      stck_hgpr?: string;
      stck_lwpr?: string;
      acml_tr_pbmn?: string;
    }>;
  };

  let data: HistoricalResponse;
  try {
    data = await callKiwoom<HistoricalResponse>(
      endpoint,
      params,
      HISTORICAL_TR_ID,
    );
  } catch (error) {
    if (!IS_PRODUCTION) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.warn(
        `[Kiwoom] 히스토리컬 데이터 호출 실패, 모의 데이터로 대체합니다. 사유: ${message}`,
      );
      return getMockCandles(timeframe);
    }

    throw error instanceof Error ? error : new Error("히스토리컬 데이터 호출 실패");
  }

  const list = data.output2 ?? [];

  return list
    .map((row) => {
      const timeValue = isDailyFrame(timeframe)
        ? row.stck_bsop_date
        : row.stck_cntg_hour;

      if (!timeValue) {
        return null;
      }

      return {
        time: timeValue,
        open: toNumber(row.stck_oprc),
        high: toNumber(row.stck_hgpr),
        low: toNumber(row.stck_lwpr),
        close: toNumber(row.stck_clpr),
        volume: toNumber(row.acml_tr_pbmn),
      };
    })
    .filter((entry): entry is Candle => Boolean(entry))
    .reverse();
}

export async function fetchRealtimeQuote(symbol: string): Promise<Quote> {
  if (!symbol) {
    throw new Error("종목 코드를 입력하세요.");
  }

  if (MOCK_MODE || !KIWOOM_BASE_URL) {
    return getMockQuote();
  }

  const params = new URLSearchParams({
    fid_cond_mrkt_div_code: "J",
    fid_input_iscd: symbol,
  });

  type QuoteResponse = {
    output?: {
      iscd_stat_cls_code?: string;
      ht_iskss_vol?: string;
      stck_prpr?: string;
      prdy_vrss?: string;
      prdy_ctrt?: string;
      acml_vol?: string;
      acml_tr_pbmn?: string;
      stck_hgpr?: string;
      stck_lwpr?: string;
      stck_oprc?: string;
      bstp_kor_isnm?: string;
    };
  };

  let data: QuoteResponse;
  try {
    data = await callKiwoom<QuoteResponse>(
      "/uapi/domestic-stock/v1/quotations/inquire-price",
      params,
      QUOTE_TR_ID,
    );
  } catch (error) {
    if (!IS_PRODUCTION) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.warn(
        `[Kiwoom] 실시간 시세 호출 실패, 모의 데이터로 대체합니다. 사유: ${message}`,
      );
      return getMockQuote();
    }

    throw error instanceof Error ? error : new Error("실시간 시세 호출 실패");
  }

  const output = data.output ?? {};

  const price = toNumber(output.stck_prpr);
  const change = toNumber(output.prdy_vrss);
  const changePercent = Number(output.prdy_ctrt ?? "0");

  return {
    symbol,
    name: output.bstp_kor_isnm,
    price,
    change,
    changePercent,
    open: toNumber(output.stck_oprc),
    high: toNumber(output.stck_hgpr),
    low: toNumber(output.stck_lwpr),
    volume: toNumber(output.acml_vol),
    updatedAt: new Date().toISOString(),
  };
}
