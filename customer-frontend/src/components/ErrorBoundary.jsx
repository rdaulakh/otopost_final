import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Report error to monitoring service (if available)
    if (window.reportError) {
      window.reportError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV
      
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-red-800 dark:text-red-200">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                We encountered an unexpected error. Don't worry, we're working to fix it.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error ID for support */}
              <div className="text-center">
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                  Error ID: {this.state.errorId}
                </Badge>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Please include this ID when contacting support
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Development error details */}
              {isDevelopment && this.state.error && (
                <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center mb-2">
                    <Bug className="h-4 w-4 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800 dark:text-red-200">
                      Development Error Details
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                        Error Message:
                      </h4>
                      <pre className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 p-2 rounded overflow-x-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                          Component Stack:
                        </h4>
                        <pre className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Help text */}
              <div className="text-center text-sm text-red-600 dark:text-red-400">
                <p>
                  If this problem persists, please contact our support team at{' '}
                  <a 
                    href="mailto:support@example.com" 
                    className="underline hover:no-underline"
                  >
                    support@example.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
