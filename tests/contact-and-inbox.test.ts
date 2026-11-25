import assert from "node:assert/strict";
import test from "node:test";
import type { ContactMessage } from "../lib/contact-types.ts";
import {
  filterMessages,
  inboxReducer,
  runOptimisticMutation,
  type InboxState,
} from "../lib/optimistic-inbox.ts";
import {
  handleRequest,
  type D1DatabaseLike,
  type D1PreparedStatementLike,
  type RateLimitBindingLike,
  type WorkerEnv,
} from "../worker/src/index.ts";

interface StoredMsg {
  id: string;
  name: string;
  email: string;
  message: string;
  submission_hash: string | null;
  status: "New" | "Replied" | "Closed";
  created_at: string;
  updated_at: string;
}

interface StoredReply {
  id: string;
  message_id: string;
  client_reply_id: string | null;
  body: string;
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

function createMockD1(options?: { failWrites?: boolean }): D1DatabaseLike & {
  messages: StoredMsg[];
  replies: StoredReply[];
} {
  const messages: StoredMsg[] = [];
  const replies: StoredReply[] = [];

  const makeStmt = (sql: string, bound: unknown[] = []): D1PreparedStatementLike => ({
    bind(...values: unknown[]) {
      return makeStmt(sql, values);
    },
    async first<T>() {
      const normalized = sql.replace(/\s+/g, " ").trim();
      if (normalized.includes("WHERE submission_hash = ? AND created_at >= ?")) {
        const [hash, windowStart] = bound as [string, string];
        const row = messages.find(
          (m) => m.submission_hash === hash && m.created_at >= windowStart
        );
        return (row ? { id: row.id } : null) as T | null;
      }
      if (normalized.startsWith("SELECT id, status FROM contact_messages WHERE id = ?")) {
        const row = messages.find((m) => m.id === bound[0]);
        return (row ? { id: row.id, status: row.status } : null) as T | null;
      }
      if (normalized.startsWith("SELECT id, name, email, message, status")) {
        const row = messages.find((m) => m.id === bound[0]);
        return (row ?? null) as T | null;
      }
      if (
        normalized.startsWith(
          "SELECT id, message_id, client_reply_id, body, created_at FROM admin_replies WHERE message_id = ? AND client_reply_id = ?"
        )
      ) {
        const row = replies.find(
          (r) => r.message_id === bound[0] && r.client_reply_id === bound[1]
        );
        return (row ?? null) as T | null;
      }
      return null;
    },
    async all<T>() {
      const normalized = sql.replace(/\s+/g, " ").trim();
      if (normalized.includes("FROM contact_messages")) {
        const sorted = [...messages].sort((a, b) =>
          b.created_at.localeCompare(a.created_at)
        );
        return { results: sorted as unknown as T[] };
      }
      if (normalized.includes("FROM admin_replies WHERE message_id = ?")) {
        const filtered = replies
          .filter((r) => r.message_id === bound[0])
          .sort((a, b) => a.created_at.localeCompare(b.created_at));
        return { results: filtered as unknown as T[] };
      }
      if (normalized.includes("FROM admin_replies")) {
        const sorted = [...replies].sort((a, b) =>
          a.created_at.localeCompare(b.created_at)
        );
        return { results: sorted as unknown as T[] };
      }
      return { results: [] };
    },
    async run() {
      if (options?.failWrites) {
        return { success: false, meta: { changes: 0 } };
      }
      const normalized = sql.replace(/\s+/g, " ").trim();
      if (normalized.startsWith("INSERT INTO contact_messages")) {
        const [id, name, email, message, submission_hash, created_at, updated_at] =
          bound as string[];
        messages.push({
          id,
          name,
          email,
          message,
          submission_hash,
          status: "New",
          created_at,
          updated_at,
        });
        return { success: true, meta: { changes: 1 } };
      }
      if (normalized.startsWith("INSERT INTO admin_replies")) {
        const [id, message_id, client_reply_id, body, created_at] = bound as [
          string,
          string,
          string | null,
          string,
          string,
        ];
        replies.push({ id, message_id, client_reply_id, body, created_at });
        return { success: true, meta: { changes: 1 } };
      }
      if (normalized.startsWith("UPDATE contact_messages SET status = ?")) {
        const [status, updated_at, id] = bound as [
          "New" | "Replied" | "Closed",
          string,
          string,
        ];
        const row = messages.find((m) => m.id === id);
        if (!row) return { success: true, meta: { changes: 0 } };
        row.status = status;
        row.updated_at = updated_at;
        return { success: true, meta: { changes: 1 } };
      }
      if (normalized.startsWith("DELETE FROM admin_replies WHERE message_id = ?")) {
        const id = bound[0] as string;
        for (let i = replies.length - 1; i >= 0; i--) {
          if (replies[i].message_id === id) replies.splice(i, 1);
        }
        return { success: true, meta: { changes: 1 } };
      }
      if (normalized.startsWith("DELETE FROM contact_messages WHERE id = ?")) {
        const id = bound[0] as string;
        const idx = messages.findIndex((m) => m.id === id);
        if (idx === -1) return { success: true, meta: { changes: 0 } };
        messages.splice(idx, 1);
        return { success: true, meta: { changes: 1 } };
      }
      return { success: true, meta: { changes: 0 } };
    },
  });

  return {
    messages,
    replies,
    prepare(query: string) {
      return makeStmt(query);
    },
    async batch(statements: D1PreparedStatementLike[]) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
  };
}

function makeBaseEnv(overrides?: Partial<WorkerEnv>): WorkerEnv {
  return {
    DB: createMockD1(),
    ADMIN_TOKEN: "super-secret-admin-token",
    SESSION_SECRET: "super-secret-hmac-key",
    ALLOWED_ORIGINS: "https://sakthib.pages.dev,http://localhost:3000",
    CONTACT_LIMITER: createLimiter(5),
    ADMIN_AUTH_LIMITER: createLimiter(5),
    ADMIN_WRITE_LIMITER: createLimiter(30),
    PUBLIC_LIMITER: createLimiter(30),
    ...overrides,
  };
}

const VALID_ORIGIN = "https://sakthib.pages.dev";
const MSG_UUID = "11111111-1111-4111-8111-111111111111";

test("1 & 7. Normal contact submission succeeds and duplicate submission returns 409", async () => {
  const db = createMockD1();
  let telegramCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    telegramCalls += 1;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  try {
    const env = makeBaseEnv({
      DB: db,
      TELEGRAM_BOT_TOKEN: "tg-token",
      TELEGRAM_CHAT_ID: "12345",
    });

    const payload = JSON.stringify({
      name: "Ananya Rao",
      email: "ananya@example.com",
      message: "Interested in discussing a cloud engineering role.",
    });

    const res1 = await handleRequest(
      new Request("https://worker.example/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: VALID_ORIGIN,
          "CF-Connecting-IP": "203.0.113.10",
        },
        body: payload,
      }),
      env
    );
    assert.equal(res1.status, 201);
    assert.equal(db.messages.length, 1);
    assert.equal(telegramCalls, 1);

    // Duplicate replay
    const res2 = await handleRequest(
      new Request("https://worker.example/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: VALID_ORIGIN,
          "CF-Connecting-IP": "203.0.113.10",
        },
        body: payload,
      }),
      env
    );
    assert.equal(res2.status, 409);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("2. Excessive contact submissions return 429 with Retry-After", async () => {
  const env = makeBaseEnv({ CONTACT_LIMITER: createLimiter(2) });

  for (let i = 0; i < 2; i++) {
    const res = await handleRequest(
      new Request("https://worker.example/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CF-Connecting-IP": "198.51.100.7",
        },
        body: JSON.stringify({
          name: "Tester",
          email: `t${i}@example.com`,
          message: `Unique valid message number ${i} here.`,
        }),
      }),
      env
    );
    assert.equal(res.status, 201);
  }

  const limitedRes = await handleRequest(
    new Request("https://worker.example/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "198.51.100.7",
      },
      body: JSON.stringify({
        name: "Tester",
        email: "t3@example.com",
        message: "Third message should be rate limited.",
      }),
    }),
    env
  );
  assert.equal(limitedRes.status, 429);
  assert.equal(limitedRes.headers.get("Retry-After"), "60");
});

test("3, 4, 5, 6. Invalid JSON, wrong Content-Type, oversized payload, invalid email, and honeypot", async () => {
  const env = makeBaseEnv();

  // Wrong Content-Type -> 415
  const wrongType = await handleRequest(
    new Request("https://worker.example/api/contact", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "hello",
    }),
    env
  );
  assert.equal(wrongType.status, 415);

  // Malformed JSON -> 400
  const badJson = await handleRequest(
    new Request("https://worker.example/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad-json",
    }),
    env
  );
  assert.equal(badJson.status, 400);

  // Oversized payload -> 413
  const bigBody = JSON.stringify({
    name: "Tester",
    email: "t@example.com",
    message: "x".repeat(20_000),
  });
  const oversized = await handleRequest(
    new Request("https://worker.example/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bigBody,
    }),
    env
  );
  assert.equal(oversized.status, 413);

  // Invalid email -> 400
  const badEmail = await handleRequest(
    new Request("https://worker.example/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Tester",
        email: "not-an-email",
        message: "Valid length message here.",
      }),
    }),
    env
  );
  assert.equal(badEmail.status, 400);

  // Honeypot -> 400
  const honeypot = await handleRequest(
    new Request("https://worker.example/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bot",
        email: "bot@example.com",
        message: "Automated spam message.",
        company: "SpamCorp",
      }),
    }),
    env
  );
  assert.equal(honeypot.status, 400);
});

test("8, 9, 10, 11, 12, 13, 19. Admin auth, brute-force protection, and unauthorized access", async () => {
  const env = makeBaseEnv({ ADMIN_AUTH_LIMITER: createLimiter(2) });

  // 8. Unauthenticated admin access -> 401
  const unauthList = await handleRequest(
    new Request("https://worker.example/api/admin/messages"),
    env
  );
  assert.equal(unauthList.status, 401);

  // 11. Unauthorized reply creation -> 401
  const unauthReply = await handleRequest(
    new Request(`https://worker.example/api/admin/messages/${MSG_UUID}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: VALID_ORIGIN },
      body: JSON.stringify({ body: "Hack" }),
    }),
    env
  );
  assert.equal(unauthReply.status, 401);

  // 12. Unauthorized status change -> 401
  const unauthStatus = await handleRequest(
    new Request(`https://worker.example/api/admin/messages/${MSG_UUID}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: VALID_ORIGIN },
      body: JSON.stringify({ status: "Closed" }),
    }),
    env
  );
  assert.equal(unauthStatus.status, 401);

  // 13. Unauthorized deletion -> 401
  const unauthDelete = await handleRequest(
    new Request(`https://worker.example/api/admin/messages/${MSG_UUID}`, {
      method: "DELETE",
      headers: { Origin: VALID_ORIGIN },
    }),
    env
  );
  assert.equal(unauthDelete.status, 401);

  // 19. Invalid / tampered cookie & wrong Bearer token -> 401
  const tamperedCookie = await handleRequest(
    new Request("https://worker.example/api/admin/messages", {
      headers: { Cookie: "admin_session=ZmFrZQ.dGFtcGVyZWQ" },
    }),
    env
  );
  assert.equal(tamperedCookie.status, 401);

  const wrongBearer = await handleRequest(
    new Request("https://worker.example/api/admin/messages", {
      headers: { Authorization: "Bearer wrong-token" },
    }),
    env
  );
  assert.equal(wrongBearer.status, 401);

  // 9 & 10. Invalid credentials + brute-force 429
  for (let i = 0; i < 2; i++) {
    const badLogin = await handleRequest(
      new Request("https://worker.example/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CF-Connecting-IP": "203.0.113.99",
        },
        body: JSON.stringify({ token: "wrong" }),
      }),
      env
    );
    assert.equal(badLogin.status, 401);
  }
  const bruteForced = await handleRequest(
    new Request("https://worker.example/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Connecting-IP": "203.0.113.99",
      },
      body: JSON.stringify({ token: "wrong" }),
    }),
    env
  );
  assert.equal(bruteForced.status, 429);
});

test("14, 15, 16, 17, 18, 20. SQLi, XSS, CORS, CSRF, method violations, and full admin flow", async () => {
  const db = createMockD1();
  const env = makeBaseEnv({ DB: db });

  // 16. Invalid CORS origin -> 403 without Allow-Origin
  const badCors = await handleRequest(
    new Request("https://worker.example/api/health", {
      headers: { Origin: "https://evil.example" },
    }),
    env
  );
  assert.equal(badCors.status, 403);
  assert.equal(badCors.headers.get("Access-Control-Allow-Origin"), null);

  // 18. HTTP method violation -> 405
  const badMethod = await handleRequest(
    new Request("https://worker.example/api/contact", { method: "DELETE" }),
    env
  );
  assert.equal(badMethod.status, 405);

  // 14 & 15. SQLi + Stored XSS payloads safely stored via parameterized query
  const sqliXssRes = await handleRequest(
    new Request("https://worker.example/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: VALID_ORIGIN },
      body: JSON.stringify({
        name: "Robert'); DROP TABLE contact_messages;--",
        email: "sqli@example.com",
        message: `<script>alert("xss")</script> ' OR 1=1 --`,
      }),
    }),
    env
  );
  assert.equal(sqliXssRes.status, 201);
  assert.equal(sqliXssRes.headers.get("X-Content-Type-Options"), "nosniff");
  const { id: createdId } = (await sqliXssRes.json()) as { id: string };

  // 20. Admin login -> extract HttpOnly cookie
  const loginRes = await handleRequest(
    new Request("https://worker.example/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: VALID_ORIGIN,
      },
      body: JSON.stringify({ token: "super-secret-admin-token" }),
    }),
    env
  );
  assert.equal(loginRes.status, 200);
  const setCookie = loginRes.headers.get("Set-Cookie") || "";
  assert.ok(setCookie.includes("admin_session="));
  assert.ok(setCookie.includes("HttpOnly"));
  const cookiePair = setCookie.split(";")[0];

  // 17. CSRF attempt: cookie present, missing Origin -> 403
  const csrfRes = await handleRequest(
    new Request(`https://worker.example/api/admin/messages/${createdId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiePair,
      },
      body: JSON.stringify({ status: "Closed" }),
    }),
    env
  );
  assert.equal(csrfRes.status, 403);

  // Invalid UUID path parameter -> 400
  const badIdRes = await handleRequest(
    new Request("https://worker.example/api/admin/messages/not-a-uuid", {
      headers: { Cookie: cookiePair },
    }),
    env
  );
  assert.equal(badIdRes.status, 400);

  // Normal admin read, reply, status update, delete, logout
  const listRes = await handleRequest(
    new Request("https://worker.example/api/admin/messages", {
      headers: { Cookie: cookiePair, Origin: VALID_ORIGIN },
    }),
    env
  );
  assert.equal(listRes.status, 200);

  const replyRes = await handleRequest(
    new Request(`https://worker.example/api/admin/messages/${createdId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiePair,
        Origin: VALID_ORIGIN,
      },
      body: JSON.stringify({ body: "Reviewed safely.", clientReplyId: "c1" }),
    }),
    env
  );
  assert.equal(replyRes.status, 201);

  const statusRes = await handleRequest(
    new Request(`https://worker.example/api/admin/messages/${createdId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiePair,
        Origin: VALID_ORIGIN,
      },
      body: JSON.stringify({ status: "Closed" }),
    }),
    env
  );
  assert.equal(statusRes.status, 200);

  const delRes = await handleRequest(
    new Request(`https://worker.example/api/admin/messages/${createdId}`, {
      method: "DELETE",
      headers: { Cookie: cookiePair, Origin: VALID_ORIGIN },
    }),
    env
  );
  assert.equal(delRes.status, 200);
  assert.equal(db.messages.length, 0);
});

test("Optimistic UI: reply confirm & rollback, status revert, delete restore, and client filtering", async () => {
  const sampleMessage: ContactMessage = {
    id: MSG_UUID,
    name: "Ananya",
    email: "ananya@example.com",
    message: "Cloud engineering inquiry",
    status: "New",
    createdAt: "2026-11-25T00:00:00.000Z",
    updatedAt: "2026-11-25T00:00:00.000Z",
    replies: [],
  };

  let state: InboxState = {
    messages: [sampleMessage],
    selectedId: MSG_UUID,
    searchQuery: "",
    statusFilter: "All",
  };
  const dispatch = (action: Parameters<typeof inboxReducer>[1]) => {
    state = inboxReducer(state, action);
  };

  const failedReply = await runOptimisticMutation({
    applyOptimistic: () =>
      dispatch({
        type: "OPTIMISTIC_ADD_REPLY",
        messageId: MSG_UUID,
        reply: {
          id: "temp-1",
          messageId: MSG_UUID,
          body: "Draft reply",
          createdAt: "2026-11-25T01:00:00.000Z",
          pending: true,
        },
      }),
    commit: async () => {
      throw new Error("Network timeout");
    },
    rollback: () =>
      dispatch({ type: "ROLLBACK_REPLY", messageId: MSG_UUID, tempId: "temp-1" }),
  });
  assert.equal(failedReply.ok, false);
  assert.equal(state.messages[0].replies.length, 0);

  const failedStatus = await runOptimisticMutation({
    applyOptimistic: () =>
      dispatch({
        type: "OPTIMISTIC_STATUS",
        messageId: MSG_UUID,
        status: "Closed",
      }),
    commit: async () => {
      throw new Error("D1 error");
    },
    rollback: () =>
      dispatch({
        type: "ROLLBACK_STATUS",
        messageId: MSG_UUID,
        previousStatus: "New",
      }),
  });
  assert.equal(failedStatus.ok, false);
  assert.equal(state.messages[0].status, "New");

  const snapshot = state.messages[0];
  const failedDelete = await runOptimisticMutation({
    applyOptimistic: () =>
      dispatch({ type: "OPTIMISTIC_DELETE", messageId: MSG_UUID }),
    commit: async () => {
      throw new Error("Delete failed");
    },
    rollback: () =>
      dispatch({ type: "RESTORE_MESSAGE", message: snapshot, index: 0 }),
  });
  assert.equal(failedDelete.ok, false);
  assert.equal(state.messages.length, 1);
  assert.equal(filterMessages(state.messages, "New", "ananya").length, 1);
});
