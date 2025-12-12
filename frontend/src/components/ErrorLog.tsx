import React, { useState, useEffect } from "react";
import { AlertTriangle, ExternalLink, RefreshCw, Filter } from "lucide-react";

interface ErrorEntry {
  id: string;
  timestamp: Date;
  message: string;
  level: "error" | "warning" | "info";
  source: "api" | "frontend" | "network";
  traceId?: string;
  details?: any;
}

export const ErrorLog: React.FC = () => {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "error" | "warning">("all");

  // Mock error data (in real app, this would come from Sentry API)
  useEffect(() => {
    const mockErrors: ErrorEntry[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        message: "Failed to fetch download status",
        level: "error",
        source: "api",
        traceId: "abc123def456",
        details: { endpoint: "/v1/download/status/123", status: 500 },
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        message: "Network timeout during file check",
        level: "warning",
        source: "network",
        traceId: "def456ghi789",
        details: { timeout: 30000, endpoint: "/v1/download/check" },
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        message: "Sentry test error triggered",
        level: "error",
        source: "api",
        traceId: "ghi789jkl012",
        details: { intentional: true, fileId: 70000 },
      },
    ];

    setErrors(mockErrors);
  }, []);

  const filteredErrors = errors.filter(
    (error) => filter === "all" || error.level === filter,
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "api":
        return "🔧";
      case "frontend":
        return "💻";
      case "network":
        return "🌐";
      default:
        return "❓";
    }
  };

  const openInSentry = () => {
    const sentryUrl = import.meta.env.VITE_SENTRY_URL || "https://sentry.io";
    window.open(sentryUrl, "_blank");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Error Log</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Levels</option>
            <option value="error">Errors Only</option>
            <option value="warning">Warnings Only</option>
          </select>
          <button
            onClick={openInSentry}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Sentry
          </button>
        </div>
      </div>

      {filteredErrors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No errors found</p>
          <p className="text-sm">That's a good thing! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredErrors.map((error) => (
            <div
              key={error.id}
              className={`border rounded-lg p-4 ${getLevelColor(error.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="mr-2">{getSourceIcon(error.source)}</span>
                    <span className="text-sm font-medium capitalize">
                      {error.level}
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-600 capitalize">
                      {error.source}
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 mb-2">{error.message}</p>

                  {error.traceId && (
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">Trace ID:</span>
                      <code className="ml-1 bg-gray-100 px-1 rounded">
                        {error.traceId}
                      </code>
                    </div>
                  )}

                  {error.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        Show details
                      </summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(error.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">
              {errors.filter((e) => e.level === "error").length}
            </div>
            <div className="text-xs text-gray-500">Errors</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {errors.filter((e) => e.level === "warning").length}
            </div>
            <div className="text-xs text-gray-500">Warnings</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-600">
              {errors.length}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};
