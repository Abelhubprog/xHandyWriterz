import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and display errors
 * in the component tree.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-900">
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          {this.state.error && (
            <div className="mb-4">
              <p className="font-medium">Error:</p>
              <pre className="bg-red-100 p-3 rounded mt-1 text-sm whitespace-pre-wrap overflow-auto">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
          {this.state.errorInfo && (
            <div>
              <p className="font-medium">Component Stack:</p>
              <pre className="bg-red-100 p-3 rounded mt-1 text-sm whitespace-pre-wrap overflow-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 