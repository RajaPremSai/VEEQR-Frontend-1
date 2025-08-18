import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="code-split-error">
          <div
            className="error-icon"
            style={{ fontSize: "3rem", marginBottom: "1rem" }}
          >
            ⚠️
          </div>
          <h3>Something went wrong</h3>
          <p>
            {this.props.fallbackMessage ||
              "An unexpected error occurred. Please try refreshing the page."}
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "var(--gray-100)",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
                fontSize: "var(--text-sm)",
                fontFamily: "monospace",
              }}
            >
              <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>
                Error Details (Development)
              </summary>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <button
            className="retry-button"
            onClick={this.handleRetry}
            style={{ marginTop: "1rem" }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
