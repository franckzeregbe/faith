type ErrorLevel = 'info' | 'warning' | 'error' | 'critical'

interface AppError {
  message: string
  level: ErrorLevel
  timestamp: Date
  context?: Record<string, unknown>
}

class ErrorHandler {
  private errors: AppError[] = []
  private listeners: Array<(error: AppError) => void> = []

  log(message: string, level: ErrorLevel = 'error', context?: Record<string, unknown>): void {
    const error: AppError = {
      message,
      level,
      timestamp: new Date(),
      context,
    }

    this.errors.push(error)

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift()
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(error))

    // Log to console in development
    if (import.meta.env.DEV) {
      const method = level === 'critical' || level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'
      console[method](`[${level.toUpperCase()}] ${message}`, context)
    }
  }

  subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  getErrors(): AppError[] {
    return [...this.errors]
  }

  clearErrors(): void {
    this.errors = []
  }
}

export const errorHandler = new ErrorHandler()

export function handleError(error: unknown, context?: string): string {
  let message = 'Une erreur inattendue s\'est produite'

  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  }

  errorHandler.log(message, 'error', { context })
  return message
}
