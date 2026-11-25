import assert from "node:assert/strict";
import test from "node:test";
import {
  handleRequest,
  type D1DatabaseLike,
  type D1PreparedStatementLike,
  type RateLimitBindingLike,
  type WorkerEnv,
} from "../worker/src/index.ts";

interface StoredVisit {
  id: string;
  visitor_id: string;
  path: string;
  referrer: string | null;
  created_at: string;
}

function createLimiter(maxCalls: number): RateLimitBindingLike {
  const counts = new Map<string, number>();
  return {
    async limit({ key }: { key: string }) {
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return { success: next <= maxCalls };
    },
  };
}

function createMockAnalyticsD1(): D1DatabaseLike & { visits: StoredVisit[] } {
  const visits: StoredVisit[] = [];

  const makeStmt = (
    sql: string,
    bound: unknown[] = []
  ): D1PreparedStatementLike => ({
    bind(...values: unknown[]) {
      return makeStmt(sql, values);
    },
    async first<T>() {
      const normalized = sql.replace(/\s+/g, " ").trim();
      if (normalized.includes("AS total_visitors")) {
        const unique = new Set(visits.map((v) => v.visitor_id));
        return {
          total_visitors: unique.size,
          total_views: visits.length,
        } as unknown as T;
      }
      if (
        normalized.includes("FROM page_visits WHERE created_at >= ?") &&
        !normalized.includes("GROUP BY")
      ) {
        const since = String(bound[0] ?? "");
        const filtered = visits.filter((v) => v.created_at >= since);
        const unique = new Set(filtered.map((v) => v.visitor_id));
        return {
          visitors: unique.size,
          views: filtered.length,
        } as unknown as T;
      }
      return null;
    },
    async all<T>() {
      const normalized = sql.replace(/\s+/g, " ").trim();
      if (normalized.includes("GROUP BY substr(created_at, 1, 10)")) {
        const since = String(bound[0] ?? "");
        const byDate = new Map<string, StoredVisit[]>();
        for (const v of visits) {
          if (v.created_at < since) continue;
          const date = v.created_at.slice(0, 10);
          const list = byDate.get(date) ?? [];
          list.push(v);
          byDate.set(date, list);
        }
        const results = Array.from(byDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, list]) => ({
            date,
            visitors: new Set(list.map((v) => v.visitor_id)).size,
            views: list.length,
          }));
        return { results: results as unknown as T[] };
      }

      if (normalized.includes("GROUP BY path")) {
        const byPath = new Map<string, StoredVisit[]>();
        for (const v of visits) {
          const list = byPath.get(v.path) ?? [];
          list.push(v);
          byPath.set(v.path, list);
        }
        const results = Array.from(byPath.entries())
          .map(([path, list]) => ({
            path,
            visitors: new Set(list.map((v) => v.visitor_id)).size,
            views: list.length,
          }))
          .sort((a, b) => b.views - a.views || b.visitors - a.visitors)
          .slice(0, 10);
        return { results: results as unknown as T[] };
      }

      return { results: [] };
    },
    async run() {
      const normalized = sql.replace(/\s+/g, " ").trim();
      if (normalized.startsWith("INSERT INTO page_visits")) {
        const [id, visitor_id, path, referrer, created_at] = bound as [
          string,
          string,
          string,
          string | null,
          string,
        ];
        visits.push({ id, visitor_id, path, referrer, created_at });
        return { success: true, meta: { changes: 1 } };
      }
      return { success: true, meta: { changes: 0 } };
    },
  });

  return {
    visits,
    prepare(query: string) {
      return makeStmt(query);
    },
    async batch(statements: D1PreparedStatementLike[]) {
      const out: unknown[] = [];
      for (const s of statements) {
        out.push(await s.run());
      }
      return out;
    },
  };
}

function createEnv(db: D1DatabaseLike, maxPublic = 50): WorkerEnv {
  return {
    DB: db,
    ALLOWED_ORIGINS: "https://sakthib.pages.dev,http://localhost:3000",
    PUBLIC_LIMITER: createLimiter(maxPublic),
  };
}

test("Analytics visit tracking normalizes paths, counts unique visitors, and summarizes traffic", async () => {
  const db = createMockAnalyticsD1();
  const env = createEnv(db);

  const visitorA = "11111111-1111-4111-8111-111111111111";
  const visitorB = "22222222-2222-4222-8222-222222222222";

  const postVisit = (body: unknown, ip = "198.51.100.1") =>
    handleRequest(
      new Request("https://worker.example/api/analytics/visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://sakthib.pages.dev",
          "CF-Connecting-IP": ip,
          "User-Agent": "TestBrowser/1.0",
        },
        body: JSON.stringify(body),
      }),
      env
    );

  // Visitor A visits / and /about (normalized to /about/)
  const r1 = await postVisit({ path: "/", visitorId: visitorA });
  assert.equal(r1.status, 201);

  const r2 = await postVisit({ path: "/about?ref=nav", visitorId: visitorA });
  assert.equal(r2.status, 201);

  // Visitor B visits / without a client visitorId (server hashes IP + UA)
  const r3 = await postVisit({ path: "/" }, "198.51.100.2");
  assert.equal(r3.status, 201);

  // Visitor C visits /projects/
  const r4 = await postVisit({ path: "/projects/", visitorId: visitorB });
  assert.equal(r4.status, 201);

  assert.equal(db.visits.length, 4);
  assert.equal(db.visits[1].path, "/about/");

  const summaryRes = await handleRequest(
    new Request("https://worker.example/api/analytics/summary?days=14", {
      method: "GET",
      headers: {
        Origin: "https://sakthib.pages.dev",
        "CF-Connecting-IP": "198.51.100.1",
      },
    }),
    env
  );

  assert.equal(summaryRes.status, 200);
  const json = (await summaryRes.json()) as {
    ok: boolean;
    data: {
      totalVisitors: number;
      totalPageViews: number;
      todayVisitors: number;
      todayPageViews: number;
      days: number;
      daily: Array<{ date: string; visitors: number; views: number }>;
      topPages: Array<{ path: string; visitors: number; views: number }>;
    };
  };

  assert.equal(json.ok, true);
  assert.equal(json.data.totalVisitors, 3);
  assert.equal(json.data.totalPageViews, 4);
  assert.equal(json.data.todayVisitors, 3);
  assert.equal(json.data.todayPageViews, 4);
  assert.equal(json.data.days, 14);
  assert.equal(json.data.daily.length, 1);
  assert.equal(json.data.topPages[0].path, "/");
  assert.equal(json.data.topPages[0].views, 2);
  assert.equal(json.data.topPages[0].visitors, 2);
});

test("Analytics endpoints validate input and enforce rate limits", async () => {
  const db = createMockAnalyticsD1();
  const env = createEnv(db, 2);

  const badPathRes = await handleRequest(
    new Request("https://worker.example/api/analytics/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://sakthib.pages.dev",
        "CF-Connecting-IP": "198.51.100.9",
      },
      body: JSON.stringify({ path: "not-a-path" }),
    }),
    env
  );
  assert.equal(badPathRes.status, 400);

  const okRes = await handleRequest(
    new Request("https://worker.example/api/analytics/summary", {
      method: "GET",
      headers: {
        Origin: "https://sakthib.pages.dev",
        "CF-Connecting-IP": "198.51.100.9",
      },
    }),
    env
  );
  assert.equal(okRes.status, 200);

  const limitedRes = await handleRequest(
    new Request("https://worker.example/api/analytics/summary", {
      method: "GET",
      headers: {
        Origin: "https://sakthib.pages.dev",
        "CF-Connecting-IP": "198.51.100.9",
      },
    }),
    env
  );
  assert.equal(limitedRes.status, 429);
  assert.equal(limitedRes.headers.get("Retry-After"), "60");
});
