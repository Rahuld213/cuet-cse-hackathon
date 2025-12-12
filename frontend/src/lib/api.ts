import axios from "axios";
import { addTraceHeaders, withTracing } from "./telemetry";
import { logError } from "./sentry";

// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Create axios instance with tracing
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for tracing
apiClient.interceptors.request.use((config) => {
  // Add trace headers to all requests
  const traceHeaders = addTraceHeaders();
  Object.entries(traceHeaders).forEach(([key, value]) => {
    config.headers.set(key, value);
  });

  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log API errors to Sentry with context
    logError(error, {
      api_endpoint: error.config?.url,
      api_method: error.config?.method,
      api_status: error.response?.status,
    });

    return Promise.reject(error);
  },
);

// API Types
export interface DownloadJob {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  file_id: number;
  startTime: number;
  endTime?: number;
  processingTimeMs?: number;
  progress?: number;
  result?: {
    file_id: number;
    status: "completed" | "failed";
    downloadUrl?: string;
    size?: number;
    processingTimeMs: number;
    message: string;
  };
  error?: string;
}

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  checks: {
    storage: "ok" | "error";
  };
}

export interface ApiError {
  error: string;
  message: string;
  requestId?: string;
}

// API Functions with tracing
export const api = {
  // Health check
  getHealth: () =>
    withTracing("api.getHealth", "http.client", async () => {
      const response = await apiClient.get<HealthStatus>("/health");
      return response.data;
    }),

  // Start download
  startDownload: (fileId: number) =>
    withTracing("api.startDownload", "http.client", async () => {
      const response = await apiClient.post<{
        jobId: string;
        status: "queued";
        file_id: number;
        message: string;
        statusUrl: string;
      }>("/v1/download/start", { file_id: fileId });
      return response.data;
    }),

  // Get download status
  getDownloadStatus: (jobId: string) =>
    withTracing("api.getDownloadStatus", "http.client", async () => {
      const response = await apiClient.get<DownloadJob>(
        `/v1/download/status/${jobId}`,
      );
      return response.data;
    }),

  // Check file availability
  checkFile: (fileId: number, sentryTest = false) =>
    withTracing("api.checkFile", "http.client", async () => {
      const url = sentryTest
        ? `/v1/download/check?sentry_test=true`
        : "/v1/download/check";

      const response = await apiClient.post<{
        file_id: number;
        available: boolean;
        s3Key?: string;
        size?: number;
      }>(url, { file_id: fileId });
      return response.data;
    }),

  // Trigger Sentry test error
  triggerSentryTest: (fileId: number) =>
    withTracing("api.triggerSentryTest", "http.client", async () => {
      try {
        await apiClient.post("/v1/download/check?sentry_test=true", {
          file_id: fileId,
        });
      } catch (error) {
        // This is expected - the endpoint returns an error for testing
        return { success: true, error: error };
      }
    }),
};
