"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/hooks/use-analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey || typeof window === "undefined") return;

    const init = async () => {
      const posthog = await import("posthog-js").then((m) => m.default);
      posthog.init(posthogKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
      });
    };

    init();
  }, []);

  useEffect(() => {
    trackPageView(window.location.href);
  }, [pathname]);

  return <>{children}</>;
}
