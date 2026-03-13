export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly userFacing: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

let toastHandler: ((message: string, type: 'error' | 'success' | 'info') => void) | null = null;

export function registerToastHandler(
  handler: (message: string, type: 'error' | 'success' | 'info') => void,
): void {
  toastHandler = handler;
}

export function handleError(error: unknown): void {
  if (__DEV__) {
    console.error('[AppError]', error);
  }

  if (error instanceof AppError && error.userFacing && toastHandler) {
    toastHandler(error.message, 'error');
    return;
  }

  if (error instanceof Error && toastHandler) {
    toastHandler('Something went wrong. Please try again.', 'error');
  }
}
