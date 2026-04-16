/**
 * Lightweight production observability hook points.
 *
 * Wire your provider (Sentry/LogRocket/etc.) by setting:
 * - VITE_ERROR_TRACKING_ENABLED=true
 * - optional VITE_ERROR_TRACKING_DSN / VITE_ERROR_TRACKING_ENDPOINT
 *
 * This module intentionally does not bundle any tracking SDK by default.
 */

function shouldEnable() {
  return String(import.meta.env.VITE_ERROR_TRACKING_ENABLED ?? '').toLowerCase() === 'true';
}

export function initObservability() {
  if (!shouldEnable()) return;

  const dsn = import.meta.env.VITE_ERROR_TRACKING_DSN;
  const endpoint = import.meta.env.VITE_ERROR_TRACKING_ENDPOINT;

  if (import.meta.env.DEV) {
    console.info('[observability] enabled', { dsn: Boolean(dsn), endpoint: Boolean(endpoint) });
  }

  window.addEventListener('error', (event) => {
    console.error('[observability] window.error', event.error ?? event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[observability] unhandledrejection', event.reason);
  });
}
