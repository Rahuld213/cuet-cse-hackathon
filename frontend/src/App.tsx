import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppErrorBoundary } from "./components/ErrorBoundary";
import { HealthStatus } from "./components/HealthStatus";
import { DownloadManager } from "./components/DownloadManager";
import { TraceViewer } from "./components/TraceViewer";
import { ErrorLog } from "./components/ErrorLog";
import { PerformanceMetrics } from "./components/PerformanceMetrics";
import {
  Activity,
  Download,
  Eye,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <div className="min-h-screen bg-gray-100">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-blue-600 mr-3" />
                  <h1 className="text-xl font-semibold text-gray-900">
                    Download Service Observatory
                  </h1>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Real-time monitoring & observability</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Health Status - Full Width */}
            <div className="mb-8">
              <HealthStatus />
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Download Manager */}
              <div className="lg:col-span-1">
                <DownloadManager />
              </div>

              {/* Trace Viewer */}
              <div className="lg:col-span-1">
                <TraceViewer />
              </div>
            </div>

            {/* Performance Metrics - Full Width */}
            <div className="mb-8">
              <PerformanceMetrics />
            </div>

            {/* Error Log - Full Width */}
            <div className="mb-8">
              <ErrorLog />
            </div>

            {/* Footer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Observability Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start">
                  <Download className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Download Tracking
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Real-time status updates for async downloads with progress
                      tracking
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Eye className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Distributed Tracing
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      End-to-end trace correlation between frontend and backend
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Error Tracking
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Automatic error capture with Sentry integration and user
                      feedback
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <BarChart3 className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Performance Metrics
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Real-time performance monitoring with response times and
                      success rates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
