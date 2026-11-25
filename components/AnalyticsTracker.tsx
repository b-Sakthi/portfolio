"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/site-config";
import { recordPageVisit } from "@/lib/worker-api";

const VISITOR_STORAGE_KEY = "portfolio_visitor_id";
const DEDUP_WINDOW_MS = 2000;

function getOrCreateVisitorId(): string | undefined {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing && existing.trim()) {
      return existing.trim();
    }
    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : undefined;
    if (generated) {
      window.localStorage.setItem(VISITOR_STORAGE_KEY, generated);
    }
    return generated;
  } catch {
    return undefined;
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname() || "/";
  const lastTrackedRef = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!siteConfig.workerUrl) return;
    if (pathname.startsWith("/admin")) return;

    const now = Date.now();
    const last = lastTrackedRef.current;
    if (last && last.path === pathname && now - last.at < DEDUP_WINDOW_MS) {
      return;
    }
    lastTrackedRef.current = { path: pathname, at: now };

    const visitorId = getOrCreateVisitorId();
    const referrer =
      typeof document !== "undefined" && document.referrer
        ? document.referrer
        : undefined;

    void recordPageVisit({ path: pathname, referrer, visitorId }).catch(() => {
      // Fail silently so analytics never disrupts navigation
    });
  }, [pathname]);

  return null;
}
