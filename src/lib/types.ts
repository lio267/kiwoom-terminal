export type Timeframe = "D" | "W" | "M" | "60" | "30" | "15" | "5" | "1";

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  updatedAt: string;
}

export interface KiwoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
}

export interface KiwoomErrorResponse {
  error_code: string;
  message: string;
}
