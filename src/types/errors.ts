export interface ExchangeError extends Error {
  message: string;
  code?: string;
  cause?: unknown;
}