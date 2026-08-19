import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn("Sentry DSN is not provided. Sentry monitoring is disabled.");
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/primefolio\.onrender\.com/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // Replay 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Replay 100% of sessions with errors
  });

  // Temporary verification event
  Sentry.captureMessage("Primefolio verification test");
};
