/**
 * Centralized error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Safely extract error message without exposing internals
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // In production, don't expose error details
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred. Please try again later.'
    }
    return error.message
  }

  return 'An unexpected error occurred'
}

/**
 * Log error for monitoring (can be extended to send to Sentry, etc.)
 */
export function logError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const stack = error instanceof Error ? error.stack : undefined

  console.error(`[${context || 'Error'}]`, {
    message,
    stack: process.env.NODE_ENV === 'development' ? stack : undefined,
    timestamp: new Date().toISOString(),
  })

  // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { contexts: { custom: { context } } })
  // }
}






