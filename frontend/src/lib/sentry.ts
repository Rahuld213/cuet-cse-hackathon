import * as Sentry from "@sentry/react";
import { getCurrentTraceId } from "./telemetry";

// Initialize Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "",
    environment: import.meta.env.VITE_ENVIRONMENT || "development",

    // Performance monitoring
    tracesSampleRate: 1.0,

    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Custom error filtering
    beforeSend(event) {
      // Don't send errors in development unless explicitly enabled
      if (import.meta.env.DEV && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null;
      }

      // Add trace context to errors (simplified)
      const traceId = getCurrentTraceId?.();
      if (traceId) {
        event.tags = { ...event.tags, trace_id: traceId };
      }

      return event;
    },

    // Custom integrations
    integrations: [
      Sentry.browserTracingIntegration({
        // Capture interactions
        enableInp: true,
      }),
      Sentry.replayIntegration(),
    ],
  });
};

// Error boundary is available as Sentry.ErrorBoundary

// Custom error logging
export const logError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    Sentry.captureException(error);
  });
};

// Performance monitoring
export const startTransaction = (name: string, op: string) => {
  return Sentry.startSpan({ name, op }, () => {});
};

// User feedback (available as Sentry.showReportDialog)
