export interface SlowOk {
  ok: true;
  source: "downstream";
  delayedMs: number;
  ts: number;
}

export interface SlowTimeout {
  ok: false;
  fallback: true;
  reason: "timeout";
  message: string;
}

export interface WorkOk {
  ok: true;
  workTookMs: number;
}

export interface HttpResult<T> {
  status: number;
  headers: Record<string, string>;
  data?: T;
  error?: string;
}