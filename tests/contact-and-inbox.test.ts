import assert from "node:assert/strict";
import test from "node:test";
import {
  filterMessages,
  inboxReducer,
  runOptimisticMutation,
  type InboxState,
} from "../lib/optimistic-inbox.ts";
import type { ContactMessage } from "../lib/contact-types.ts";
import {
  handleRequest,
  type D1DatabaseLike,
  type D1PreparedStatementLike,
  type WorkerEnv,
} from "../worker/src/index.ts";

interface StoredMsg {
  id: string;
  name: string;
  email: string;
  message: string;
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
        const [id, name, email, message, created_at, updated_at] = bound as string[];
        messages.push({
          id,
          name,
          email,
          message,
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

test("Worker: successful contact submission persists to D1 and triggers Telegram", async () => {
  const db = createMockD1();
  let telegramCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    telegramCalls += 1;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  try {
    const env: WorkerEnv = {
      DB: db,
      ADMIN_TOKEN: "super-secret-token",
      TELEGRAM_BOT_TOKEN: "tg-bot-token",
      TELEGRAM_CHAT_ID: "123456",
    };

    const req = new Request("https://worker.example/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ananya Rao",
        email: "ananya@example.com",
        message: "Interested in discussing a cloud engineering role.",
      }),
    });

    const res = await handleRequest(req, env);
    assert.equal(res.status, 201);
    const body = (await res.json()) as { ok: boolean; id?: string };
    assert.equal(body.ok, true);
    assert.ok(body.id);
    assert.equal(db.messages.length, 1);
    assert.equal(db.messages[0].status, "New");
    assert.equal(telegramCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Worker: failed contact submission returns 400/500 structured error", async () => {
  const failingDb = createMockD1({ failWrites: true });
  const env: WorkerEnv = { DB: failingDb, ADMIN_TOKEN: "secret" };

  // Validation error
  const badReq = new Request("https://worker.example/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "A", email: "bad", message: "short" }),
  });
  const badRes = await handleRequest(badReq, env);
  assert.equal(badRes.status, 400);

  // D1 failure
  const dbFailReq = new Request("https://worker.example/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ananya Rao",
      email: "ananya@example.com",
      message: "Valid message body that is long enough.",
    }),
  });
  const dbFailRes = await handleRequest(dbFailReq, env);
  assert.equal(dbFailRes.status, 500);
});

test("Worker: admin authentication rejects unauthorized requests and allows valid Bearer token", async () => {
  const db = createMockD1();
  const env: WorkerEnv = { DB: db, ADMIN_TOKEN: "secret-123" };

  const unauthRes = await handleRequest(
    new Request("https://worker.example/api/admin/messages"),
    env
  );
  assert.equal(unauthRes.status, 401);

  const badAuthRes = await handleRequest(
    new Request("https://worker.example/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "wrong" }),
    }),
    env
  );
  assert.equal(badAuthRes.status, 401);

  const okAuthRes = await handleRequest(
    new Request("https://worker.example/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "secret-123" }),
    }),
    env
  );
  assert.equal(okAuthRes.status, 200);

  const okListRes = await handleRequest(
    new Request("https://worker.example/api/admin/messages", {
      headers: { Authorization: "Bearer secret-123" },
    }),
    env
  );
  assert.equal(okListRes.status, 200);
});

test("Worker: idempotent reply creation, status update, and deletion", async () => {
  const db = createMockD1();
  const env: WorkerEnv = { DB: db, ADMIN_TOKEN: "secret-123" };

  db.messages.push({
    id: "m1",
    name: "Visitor",
    email: "v@example.com",
    message: "Hello Sakthi, let's connect.",
    status: "New",
    created_at: "2026-11-25T00:00:00.000Z",
    updated_at: "2026-11-25T00:00:00.000Z",
  });

  // Duplicate clientReplyId only inserts once
  const replyReq1 = new Request(
    "https://worker.example/api/admin/messages/m1/replies",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer secret-123",
      },
      body: JSON.stringify({ body: "Follow up tomorrow", clientReplyId: "c1" }),
    }
  );
  const replyRes1 = await handleRequest(replyReq1, env);
  assert.equal(replyRes1.status, 201);
  assert.equal(db.messages[0].status, "Replied");

  const replyReq2 = new Request(
    "https://worker.example/api/admin/messages/m1/replies",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer secret-123",
      },
      body: JSON.stringify({ body: "Follow up tomorrow", clientReplyId: "c1" }),
    }
  );
  const replyRes2 = await handleRequest(replyReq2, env);
  assert.equal(replyRes2.status, 200);
  assert.equal(db.replies.length, 1);

  // Status update -> Closed
  const statusRes = await handleRequest(
    new Request("https://worker.example/api/admin/messages/m1/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer secret-123",
      },
      body: JSON.stringify({ status: "Closed" }),
    }),
    env
  );
  assert.equal(statusRes.status, 200);
  assert.equal(db.messages[0].status, "Closed");

  // Delete message + replies
  const delRes = await handleRequest(
    new Request("https://worker.example/api/admin/messages/m1", {
      method: "DELETE",
      headers: { Authorization: "Bearer secret-123" },
    }),
    env
  );
  assert.equal(delRes.status, 200);
  assert.equal(db.messages.length, 0);
  assert.equal(db.replies.length, 0);
});

test("Optimistic UI: reply confirm & rollback, status revert, delete restore, and client filtering", async () => {
  const sampleMessage: ContactMessage = {
    id: "m1",
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
    selectedId: "m1",
    searchQuery: "",
    statusFilter: "All",
  };
  const dispatch = (action: Parameters<typeof inboxReducer>[1]) => {
    state = inboxReducer(state, action);
  };

  // 1. Failed reply rolls back cleanly
  const failedReply = await runOptimisticMutation({
    applyOptimistic: () =>
      dispatch({
        type: "OPTIMISTIC_ADD_REPLY",
        messageId: "m1",
        reply: {
          id: "temp-1",
          messageId: "m1",
          body: "Draft reply",
          createdAt: "2026-11-25T01:00:00.000Z",
          pending: true,
        },
      }),
    commit: async () => {
      throw new Error("Network timeout");
    },
    rollback: () =>
      dispatch({ type: "ROLLBACK_REPLY", messageId: "m1", tempId: "temp-1" }),
  });
  assert.equal(failedReply.ok, false);
  assert.equal(state.messages[0].replies.length, 0);

  // 2. Successful reply confirms and transitions New -> Replied
  const okReply = await runOptimisticMutation({
    applyOptimistic: () =>
      dispatch({
        type: "OPTIMISTIC_ADD_REPLY",
        messageId: "m1",
        reply: {
          id: "temp-2",
          messageId: "m1",
          body: "Confirmed reply",
          createdAt: "2026-11-25T01:00:00.000Z",
          pending: true,
        },
      }),
    commit: async () => ({
      id: "r-real",
      messageId: "m1",
      body: "Confirmed reply",
      createdAt: "2026-11-25T01:00:01.000Z",
    }),
    onSuccess: (confirmed) =>
      dispatch({
        type: "CONFIRM_REPLY",
        messageId: "m1",
        tempId: "temp-2",
        confirmed,
        updatedStatus: "Replied",
      }),
    rollback: () =>
      dispatch({ type: "ROLLBACK_REPLY", messageId: "m1", tempId: "temp-2" }),
  });
  assert.equal(okReply.ok, true);
  assert.equal(state.messages[0].status, "Replied");
  assert.equal(state.messages[0].replies[0].pending, false);

  // 3. Failed status update reverts
  const failedStatus = await runOptimisticMutation({
    applyOptimistic: () =>
      dispatch({ type: "OPTIMISTIC_STATUS", messageId: "m1", status: "Closed" }),
    commit: async () => {
      throw new Error("D1 error");
    },
    rollback: () =>
      dispatch({
        type: "ROLLBACK_STATUS",
        messageId: "m1",
        previousStatus: "Replied",
      }),
  });
  assert.equal(failedStatus.ok, false);
  assert.equal(state.messages[0].status, "Replied");

  // 4. Failed delete restores message at original index
  const snapshot = state.messages[0];
  const failedDelete = await runOptimisticMutation({
    applyOptimistic: () =>
      dispatch({ type: "OPTIMISTIC_DELETE", messageId: "m1" }),
    commit: async () => {
      throw new Error("Delete failed");
    },
    rollback: () =>
      dispatch({ type: "RESTORE_MESSAGE", message: snapshot, index: 0 }),
  });
  assert.equal(failedDelete.ok, false);
  assert.equal(state.messages.length, 1);
  assert.equal(state.messages[0].id, "m1");

  // 5. Client-side search & status filtering
  assert.equal(filterMessages(state.messages, "Replied", "ananya").length, 1);
  assert.equal(filterMessages(state.messages, "New", "").length, 0);
});
