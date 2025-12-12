import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initSentry } from "./lib/sentry";
import { initTelemetry } from "./lib/telemetry";

// Initialize observability
initSentry();
initTelemetry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
