import React, { useState } from "react";
import { ExternalLink, Search, Clock, Zap } from "lucide-react";
import { getCurrentTraceId } from "../lib/telemetry";

export const TraceViewer: React.FC = () => {
  const [traceId, setTraceId] = useState<string>("");
  const currentTraceId = getCurrentTraceId();

  const jaegerUrl = import.meta.env.VITE_JAEGER_URL || "http://localhost:16686";

  const openInJaeger = (id: string) => {
    if (!id) return;
    const url = `${jaegerUrl}/trace/${id}`;
    window.open(url, "_blank");
  };

  const handleSearchTrace = () => {
    if (traceId.trim()) {
      openInJaeger(traceId.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Distributed Tracing
      </h2>

      {/* Current Trace */}
      {currentTraceId && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Current Trace
              </h3>
              <p className="text-xs text-blue-700 font-mono mt-1">
                {currentTraceId}
              </p>
            </div>
            <button
              onClick={() => openInJaeger(currentTraceId)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View in Jaeger
            </button>
          </div>
        </div>
      )}

      {/* Trace Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Trace by ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={traceId}
            onChange={(e) => setTraceId(e.target.value)}
            placeholder="Enter trace ID..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearchTrace}
            disabled={!traceId.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Quick Links</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`${jaegerUrl}/search?service=download-dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Zap className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Frontend Traces
              </div>
              <div className="text-xs text-gray-500">View dashboard traces</div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </a>

          <a
            href={`${jaegerUrl}/search?service=delineate-hackathon-challenge`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                API Traces
              </div>
              <div className="text-xs text-gray-500">View backend traces</div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </a>
        </div>

        <a
          href={jaegerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-600 hover:text-gray-800"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Jaeger UI
        </a>
      </div>

      {/* Trace Correlation Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Trace Correlation
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            • Frontend spans are automatically correlated with backend traces
          </p>
          <p>• API requests include trace headers for end-to-end visibility</p>
          <p>• Errors in Sentry are tagged with trace IDs for debugging</p>
          <p>• Use trace IDs to correlate logs, metrics, and errors</p>
        </div>
      </div>
    </div>
  );
};
