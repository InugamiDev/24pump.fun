export class MomentCoinError extends Error {
  override name = 'MomentCoinError';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MomentCoinError.prototype);
  }
}

export interface ErrorWithMessage {
  message: string;
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export function toErrorWithMessage(error: unknown): ErrorWithMessage {
  if (isErrorWithMessage(error)) {
    return error;
  }

  try {
    return new MomentCoinError(
      typeof error === 'string' ? error : JSON.stringify(error)
    );
  } catch {
    // fallback in case there's an error stringifying the error
    return new MomentCoinError('An unknown error occurred');
  }
}

export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}