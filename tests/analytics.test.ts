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
      if (normalized.includes("WHERE visitor_id = ? AND path = ? AND created_at >= ?")) {
        const [vId, p, windowStart] = bound as [string, string, string];
        const row = visits.find(
          (v) => v.visitor_id === vId && v.path === p && v.created_at >= windowStart
        );
        return (row ? { id: row.id } : null) as T | null;
      }
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
    ADMIN_TOKEN: "super-secret-test-token-123456",
    SESSION_SECRET: "session-secret-key-abcdef",
    ALLOWED_ORIGINS: "https://sakthib.pages.dev,http://localhost:3000",
    PUBLIC_LIMITER: createLimiter(maxPublic),
    ADMIN_AUTH_LIMITER: createLimiter(10),
  };
}

test("Anonymous visitor tracking strips query params from referrer and deduplicates visits within 5 seconds", async () => {
  const db = createMockAnalyticsD1();
  const env = createEnv(db);

  const visitorA = "11111111-1111-4111-8111-111111111111";

  const postVisit = (body: unknown) =>
    handleRequest(
      new Request("https://worker.example/api/analytics/visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://sakthib.pages.dev",
          "CF-Connecting-IP": "198.51.100.1",
          "User-Agent": "TestBrowser/1.0",
        },
        body: JSON.stringify(body),
      }),
      env
    );

  // 1. Visit with query params in referrer -> verify query params are stripped
  const r1 = await postVisit({
    path: "/about",
    visitorId: visitorA,
    referrer: "https://google.com/search?q=secret-query#hash",
  });
  assert.equal(r1.status, 201);
  assert.equal(db.visits.length, 1);
  assert.equal(db.visits[0].referrer, "https://google.com/search");

  // 2. Rapid repeat visit (same visitor and path within 5s window) -> deduplicated
  const r2 = await postVisit({
    path: "/about/",
    visitorId: visitorA,
  });
  assert.equal(r2.status, 200);
  const json2 = (await r2.json()) as { ok: boolean; deduplicated?: boolean };
  assert.equal(json2.ok, true);
  assert.equal(json2.deduplicated, true);
  // Stored visits count should still be 1
  assert.equal(db.visits.length, 1);
});

test("Direct unauthenticated access to analytics summary returns 401 Unauthorized", async () => {
  const db = createMockAnalyticsD1();
  const env = createEnv(db);

  // 1. Direct unauthenticated request to /api/admin/analytics/summary
  const res = await handleRequest(
    new Request("https://worker.example/api/admin/analytics/summary?days=14", {
      method: "GET",
      headers: {
        Origin: "https://sakthib.pages.dev",
      },
    }),
    env
  );
  assert.equal(res.status, 401);
  const json = (await res.json()) as { ok: boolean; error: string };
  assert.equal(json.ok, false);
  assert.equal(json.error, "Unauthorized.");

  // 2. Direct request to old public URL /api/analytics/summary returns 404
  const oldUrlRes = await handleRequest(
    new Request("https://worker.example/api/analytics/summary", {
      method: "GET",
      headers: { Origin: "https://sakthib.pages.dev" },
    }),
    env
  );
  assert.equal(oldUrlRes.status, 404);
});

test("Invalid or expired session / invalid admin token rejected with 401", async () => {
  const db = createMockAnalyticsD1();
  const env = createEnv(db);

  // 1. Invalid Bearer Token
  const badTokenRes = await handleRequest(
    new Request("https://worker.example/api/admin/analytics/summary", {
      method: "GET",
      headers: {
        Origin: "https://sakthib.pages.dev",
        Authorization: "Bearer wrong-token",
      },
    }),
    env
  );
  assert.equal(badTokenRes.status, 401);

  // 2. Invalid cookie token
  const badCookieRes = await handleRequest(
    new Request("https://worker.example/api/admin/analytics/summary", {
      method: "GET",
      headers: {
        Origin: "https://sakthib.pages.dev",
        Cookie: "admin_session=invalid.cookie.token",
      },
    }),
    env
  );
  assert.equal(badCookieRes.status, 401);
});

test("Authenticated administrator can access analytics summary", async () => {
  const db = createMockAnalyticsD1();
  const env = createEnv(db);

  // Seed two visits
  db.visits.push({
    id: "1",
    visitor_id: "visitor-1",
    path: "/",
    referrer: null,
    created_at: new Date().toISOString(),
  });
  db.visits.push({
    id: "2",
    visitor_id: "visitor-2",
    path: "/projects/",
    referrer: null,
    created_at: new Date().toISOString(),
  });

  // 1. Authenticate via admin auth endpoint
  const authRes = await handleRequest(
    new Request("https://worker.example/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://sakthib.pages.dev",
      },
      body: JSON.stringify({ token: "super-secret-test-token-123456" }),
    }),
    env
  );
  assert.equal(authRes.status, 200);
  const cookieHeader = authRes.headers.get("Set-Cookie");
  assert.ok(cookieHeader);
  const sessionCookie = cookieHeader.split(";")[0];

  // 2. Request analytics with the valid session cookie
  const summaryRes = await handleRequest(
    new Request("https://worker.example/api/admin/analytics/summary?days=14", {
      method: "GET",
      headers: {
        Origin: "https://sakthib.pages.dev",
        Cookie: sessionCookie,
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
    };
  };
  assert.equal(json.ok, true);
  assert.equal(json.data.totalVisitors, 2);
  assert.equal(json.data.totalPageViews, 2);
});
