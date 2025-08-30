import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-red-800/80 backdrop-blur-sm border border-red-700/50 rounded-2xl shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Seifun Error Detected</h1>
                  <p className="text-red-200">Something went wrong, but we can see exactly what!</p>
                </div>
              </div>
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>

            {/* Error Details */}
            <div className="space-y-4">
              {/* Main Error */}
              <div className="bg-red-900/50 border border-red-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Bug className="w-5 h-5 text-red-300" />
                    <span>Error Details</span>
                  </h3>
                  <button
                    onClick={this.toggleDetails}
                    className="text-red-300 hover:text-white transition-colors"
                  >
                    {showDetails ? <X className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="text-red-100 font-mono text-sm">
                  <div className="mb-2">
                    <strong>Error:</strong> {error?.name}: {error?.message}
                  </div>
                  
                  {showDetails && (
                    <div className="space-y-3 mt-4">
                      {/* Stack Trace */}
                      {error?.stack && (
                        <div>
                          <strong className="text-red-200">Stack Trace:</strong>
                          <pre className="mt-2 bg-red-950/50 p-3 rounded text-xs text-red-100 overflow-x-auto whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      
                      {/* Component Stack */}
                      {errorInfo?.componentStack && (
                        <div>
                          <strong className="text-red-200">Component Stack:</strong>
                          <pre className="mt-2 bg-red-950/50 p-3 rounded text-xs text-red-100 overflow-x-auto whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-red-900/30 border border-red-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Troubleshooting Steps</h3>
                <div className="space-y-2 text-red-100">
                  <div className="flex items-start space-x-2">
                    <span className="text-red-300">1.</span>
                    <span>Check if all required environment variables are set</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-300">2.</span>
                    <span>Verify that all dependencies are properly installed</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-300">3.</span>
                    <span>Check browser console for additional error details</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-300">4.</span>
                    <span>Try refreshing the page or clearing browser cache</span>
                  </div>
                </div>
              </div>

              {/* Environment Info */}
              <div className="bg-red-900/30 border border-red-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Environment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-red-200">User Agent:</strong>
                    <div className="text-red-100 font-mono text-xs mt-1 break-all">
                      {navigator.userAgent}
                    </div>
                  </div>
                  <div>
                    <strong className="text-red-200">URL:</strong>
                    <div className="text-red-100 font-mono text-xs mt-1 break-all">
                      {window.location.href}
                    </div>
                  </div>
                  <div>
                    <strong className="text-red-200">Timestamp:</strong>
                    <div className="text-red-100 text-xs mt-1">
                      {new Date().toISOString()}
                    </div>
                  </div>
                  <div>
                    <strong className="text-red-200">Page:</strong>
                    <div className="text-red-100 text-xs mt-1">
                      Seilor 0 - AI Assistant
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 pt-6 border-t border-red-700/50">
              <button
                onClick={this.handleRetry}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors font-medium"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-6 py-3 bg-red-800 hover:bg-red-900 text-white rounded-lg transition-colors font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}