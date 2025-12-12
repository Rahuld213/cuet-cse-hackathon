import React from "react";
import * as Sentry from "@sentry/react";
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";

interface ErrorFallbackProps {
  error: unknown;
  componentStack: string;
  eventId: string;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const handleReportIssue = () => {
    Sentry.showReportDialog();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">
            Something went wrong
          </h1>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            An unexpected error occurred in the application.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Technical details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {errorMessage}
            </pre>
          </details>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetError}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>

          <button
            onClick={handleReportIssue}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Report Issue
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Error ID: {Math.random().toString(36).substring(2, 11)}
        </div>
      </div>
    </div>
  );
};

export const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Sentry.ErrorBoundary
      fallback={(errorData) => <ErrorFallback {...errorData} />}
      showDialog
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};
