"use client";

import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  Eye,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from "react";
import type { AnalyticsSummary, DailyVisitStat } from "@/lib/analytics-types";
import { siteConfig } from "@/lib/site-config";
import {
  fetchAnalyticsSummary,
  logoutAdmin,
  verifyAdminToken,
} from "@/lib/worker-api";

const RANGE_OPTIONS = [7, 14, 30] as const;
type RangeDays = (typeof RANGE_OPTIONS)[number];

function buildContinuousSeries(
  daily: DailyVisitStat[],
  days: number
): DailyVisitStat[] {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const result: DailyVisitStat[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = days - 1; i >= 0; i--) {
    const isoDate = new Date(now - i * dayMs).toISOString().slice(0, 10);
    const existing = byDate.get(isoDate);
    result.push(
      existing ?? {
        date: isoDate,
        visitors: 0,
        views: 0,
      }
    );
  }
  return result;
}

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  if (!month || !day) return isoDate;
  return `${day}/${month}`;
}

export function AnalyticsDashboard() {
  const tokenInputId = useId();
  const [days, setDays] = useState<RangeDays>(14);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Reusable admin authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");

  const loadAnalytics = useCallback(async (selectedDays: RangeDays) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAnalyticsSummary(selectedDays);
      setSummary(data);
      setIsAuthenticated(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load visitor analytics.";
      if (msg === "Unauthorized") {
        setIsAuthenticated(false);
        setAuthError("Admin session required. Please authenticate to view analytics.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify existing admin HttpOnly session cookie on mount
  useEffect(() => {
    if (!siteConfig.workerUrl) return;

    let active = true;
    void fetchAnalyticsSummary(days)
      .then((data) => {
        if (!active) return;
        setSummary(data);
        setIsAuthenticated(true);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        const msg = err instanceof Error ? err.message : "Unable to load visitor analytics.";
        if (msg === "Unauthorized") {
          setIsAuthenticated(false);
        } else {
          setError(msg);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [days]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate = tokenInput.trim();
    if (!candidate) {
      setAuthError("Please enter your admin token.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      const result = await verifyAdminToken(candidate);
      if (!result.ok) {
        setAuthError(result.error || "Invalid admin token. Access denied.");
        return;
      }
      setIsAuthenticated(true);
      setTokenInput("");
      await loadAnalytics(days);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutAdmin();
    } finally {
      setIsAuthenticated(false);
      setSummary(null);
      setAuthError("Signed out of admin session.");
    }
  };

  const series = useMemo(
    () => (summary ? buildContinuousSeries(summary.daily, days) : []),
    [summary, days]
  );

  const maxViews = useMemo(
    () => Math.max(1, ...series.map((item) => item.views)),
    [series]
  );

  const maxPageViews = useMemo(
    () =>
      summary && summary.topPages.length > 0
        ? Math.max(1, ...summary.topPages.map((p) => p.views))
        : 1,
    [summary]
  );

  // Unauthenticated Barrier
  if (!isAuthenticated && !loading) {
    return (
      <section className="mx-auto max-w-md py-8">
        <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5D90A]/10 text-[#F5D90A]">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>

          <h1 className="font-display mt-4 text-2xl font-bold text-[#F5F5F0]">
            Private Analytics
          </h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Visitor metrics and traffic analytics are restricted to authenticated administrators.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor={tokenInputId}
                className="mb-2 block text-sm font-medium text-[#F5F5F0]"
              >
                Admin Token
              </label>
              <input
                id={tokenInputId}
                type="password"
                autoComplete="current-password"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter server-side ADMIN_TOKEN"
                className="min-h-[48px] w-full rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-base text-[#F5F5F0] placeholder:text-[#71717A] focus:border-[#F5D90A]"
              />
            </div>

            {authError && (
              <p
                role="alert"
                className="rounded-[8px] border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200"
              >
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#F5D90A] px-5 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524] disabled:opacity-70"
            >
              {authLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Unlock Analytics</span>
              )}
            </button>
          </form>

          <div className="mt-5 border-t border-[#242424] pt-4 text-center">
            <Link
              href="/admin/"
              prefetch={false}
              className="text-xs text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
            >
              Go to Admin Inbox →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#242424] pb-6">
        <div>
          <span className="font-mono-code text-meta text-[#F5D90A]">
            D1 Visitor Analytics
          </span>
          <h1 className="text-section mt-1 text-[#F5F5F0]">
            Portfolio Traffic
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#A1A1AA]">
            Privacy-friendly member visit and page view metrics stored in
            Cloudflare D1 without tracking personal data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Time range"
            className="inline-flex rounded-[8px] border border-[#242424] bg-[#141414] p-1"
          >
            {RANGE_OPTIONS.map((option) => {
              const active = days === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDays(option)}
                  aria-pressed={active}
                  className={`min-h-[36px] rounded-[6px] px-3 text-xs font-medium transition-colors ${
                    active
                      ? "bg-[#F5D90A] font-semibold text-[#0B0B0B]"
                      : "text-[#A1A1AA] hover:text-[#F5F5F0]"
                  }`}
                >
                  {option}d
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => void loadAnalytics(days)}
            disabled={loading}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A] disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/"
            prefetch={false}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
          >
            <span>Admin Inbox</span>
          </Link>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-red-500/50 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[16px] border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Could not load analytics</p>
            <p className="mt-1 text-red-200/80">{error}</p>
          </div>
        </div>
      )}

      {/* Initial Loading State */}
      {loading && !summary && !error && (
        <div className="flex min-h-[240px] items-center justify-center rounded-[16px] border border-[#242424] bg-[#141414]">
          <div className="flex items-center gap-3 text-sm text-[#A1A1AA]">
            <Loader2 className="h-5 w-5 animate-spin text-[#F5D90A]" aria-hidden="true" />
            <span>Loading visitor metrics...</span>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {summary && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-meta text-[#A1A1AA]">
                  Members Visited
                </span>
                <Users className="h-4 w-4 text-[#F5D90A]" aria-hidden="true" />
              </div>
              <p className="font-display mt-3 text-4xl font-bold tracking-tight text-[#F5F5F0]">
                {summary.totalVisitors.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#A1A1AA]">
                Unique visitors all-time
              </p>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-meta text-[#A1A1AA]">
                  Total Page Views
                </span>
                <Eye className="h-4 w-4 text-[#F5D90A]" aria-hidden="true" />
              </div>
              <p className="font-display mt-3 text-4xl font-bold tracking-tight text-[#F5F5F0]">
                {summary.totalPageViews.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#A1A1AA]">
                Total route visits recorded
              </p>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-meta text-[#A1A1AA]">
                  Visited Today
                </span>
                <Activity className="h-4 w-4 text-[#F5D90A]" aria-hidden="true" />
              </div>
              <p className="font-display mt-3 text-4xl font-bold tracking-tight text-[#F5F5F0]">
                {summary.todayVisitors.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#A1A1AA]">
                {summary.todayPageViews.toLocaleString()} page views today (UTC)
              </p>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-meta text-[#A1A1AA]">
                  Last 7 Days
                </span>
                <Calendar className="h-4 w-4 text-[#F5D90A]" aria-hidden="true" />
              </div>
              <p className="font-display mt-3 text-4xl font-bold tracking-tight text-[#F5F5F0]">
                {summary.last7DaysVisitors.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#A1A1AA]">
                {summary.last7DaysPageViews.toLocaleString()} page views in 7d
              </p>
            </div>
          </div>

          {/* Daily Traffic & Top Pages */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Daily Chart */}
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#F5F5F0]">
                    Daily Visitors & Views
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Last {days} days (UTC)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#F5D90A]" />
                    Visitors
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#3F3F46]" />
                    Page Views
                  </span>
                </div>
              </div>

              <div className="mt-6 flex h-56 items-end gap-1.5 sm:gap-2">
                {series.map((item) => {
                  const viewsPct = Math.round((item.views / maxViews) * 100);
                  const visitorsPct = Math.round(
                    (item.visitors / maxViews) * 100
                  );
                  return (
                    <div
                      key={item.date}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                      title={`${item.date}: ${item.visitors} visitors, ${item.views} views`}
                    >
                      <div className="relative flex h-full w-full items-end justify-center">
                        <div
                          style={{ height: `${Math.max(viewsPct, item.views > 0 ? 6 : 2)}%` }}
                          className="w-full max-w-[28px] rounded-t-[4px] bg-[#27272A] transition-all group-hover:bg-[#3F3F46]"
                        />
                        {item.visitors > 0 && (
                          <div
                            style={{ height: `${Math.max(visitorsPct, 6)}%` }}
                            className="absolute bottom-0 w-full max-w-[28px] rounded-t-[4px] bg-[#F5D90A]/90 transition-all group-hover:bg-[#FFE524]"
                          />
                        )}
                      </div>
                      <span className="font-mono-code hidden text-[10px] text-[#71717A] sm:block">
                        {days <= 14 || series.indexOf(item) % 3 === 0
                          ? formatShortDate(item.date)
                          : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Pages */}
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#F5F5F0]">
                  Top Pages
                </h2>
                <BarChart3
                  className="h-4 w-4 text-[#F5D90A]"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1 text-xs text-[#A1A1AA]">
                Most visited routes across the portfolio
              </p>

              {summary.topPages.length === 0 ? (
                <p className="mt-8 text-center text-sm text-[#71717A]">
                  No page visits recorded yet.
                </p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {summary.topPages.map((page) => {
                    const widthPct = Math.max(
                      6,
                      Math.round((page.views / maxPageViews) * 100)
                    );
                    return (
                      <li key={page.path} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-mono-code truncate text-[#F5F5F0]">
                            {page.path}
                          </span>
                          <span className="shrink-0 text-xs text-[#A1A1AA]">
                            {page.visitors} visitors · {page.views} views
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#242424]">
                          <div
                            style={{ width: `${widthPct}%` }}
                            className="h-full rounded-full bg-[#F5D90A]"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
