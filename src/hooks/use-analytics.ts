"use client";

import { useCallback } from "react";

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  const posthog = win.posthog as
    | { capture: (name: string, props?: Record<string, unknown>) => void }
    | undefined;

  if (posthog) {
    posthog.capture(name, properties);
  }
}

export function trackPageView(url: string) {
  trackEvent("$pageview", { $current_url: url });
}

export function useAnalytics() {
  const capture = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      trackEvent(name, properties);
    },
    []
  );

  return { capture };
}
