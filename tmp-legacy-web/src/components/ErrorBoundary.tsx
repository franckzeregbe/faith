import React, { Component, ReactNode } from 'react'
import { errorHandler } from '../utils/errorHandler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    errorHandler.log(error.message, 'critical', {
      componentStack: errorInfo.componentStack,
      error: error.toString(),
    })
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary-fallback">
          <div className="error-boundary-content">
            <span className="error-boundary-icon">⚠️</span>
            <h2>Une erreur s'est produite</h2>
            <p>Nous sommes désolés, quelque chose s'est mal passé.</p>
            {this.state.error && (
              <details className="error-boundary-details">
                <summary>Détails techniques</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
            <button
              className="btn btn-primary"
              onClick={this.handleReset}
              type="button"
            >
              Réessayer
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
