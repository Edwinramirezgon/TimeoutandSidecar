export type SlowOk = {
  ok: true;
  source: "downstream";
  delayedMs: number;
  ts: number;
};

export type SlowTimeout = {
  ok: false;
  fallback: true;
  reason: "timeout";
  message: string;
};

export type HttpResult<T> = {
  status: number;
  headers: Record<string, string>;
  data?: T;
  error?: string;
};