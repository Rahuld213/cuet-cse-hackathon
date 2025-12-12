import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

export const HealthStatus: React.FC = () => {
  const {
    data: health,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["health"],
    queryFn: api.getHealth,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });

  const getStatusIcon = () => {
    if (isLoading)
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (error) return <XCircle className="h-5 w-5 text-red-500" />;
    if (health?.status === "healthy")
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusColor = () => {
    if (isLoading) return "border-blue-200 bg-blue-50";
    if (error) return "border-red-200 bg-red-50";
    if (health?.status === "healthy") return "border-green-200 bg-green-50";
    return "border-yellow-200 bg-yellow-50";
  };

  const getStatusText = () => {
    if (isLoading) return "Checking...";
    if (error) return "Connection Error";
    if (health?.status === "healthy") return "All Systems Operational";
    return "Degraded Performance";
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              API Health Status
            </h3>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {health && (
        <div className="mt-4 grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Storage Service:</span>
            <div className="flex items-center">
              {health.checks.storage === "ok" ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={
                  health.checks.storage === "ok"
                    ? "text-green-700"
                    : "text-red-700"
                }
              >
                {health.checks.storage === "ok" ? "Operational" : "Error"}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-600">
          <p>Unable to connect to API server</p>
          <p className="text-xs text-red-500 mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}
    </div>
  );
};
