export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch(statements: D1PreparedStatementLike[]): Promise<unknown[]>;
}

export interface WorkerEnv {
  DB: D1DatabaseLike;
  ADMIN_TOKEN?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ALLOWED_ORIGINS?: string;
}

type MessageStatus = "New" | "Replied" | "Closed";

const VALID_STATUSES = new Set<MessageStatus>(["New", "Replied", "Closed"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactRow {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
}

interface ReplyRow {
  id: string;
  message_id: string;
  client_reply_id: string | null;
  body: string;
  created_at: string;
}

function getCorsHeaders(request: Request, env: WorkerEnv): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowOrigin =
    origin && allowed.includes(origin) ? origin : allowed[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders,
    },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i++) {
    const x = i < aBytes.length ? aBytes[i] : 0;
    const y = i < bBytes.length ? bBytes[i] : 0;
    diff |= x ^ y;
  }
  return diff === 0;
}

function isAuthorized(request: Request, env: WorkerEnv): boolean {
  const expected = env.ADMIN_TOKEN?.trim();
  if (!expected) return false;
  const authHeader = request.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return false;
  const provided = authHeader.slice(7).trim();
  if (!provided) return false;
  return timingSafeEqual(provided, expected);
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const data = await request.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function sendTelegramNotification(
  env: WorkerEnv,
  payload: { id: string; name: string; email: string; message: string; createdAt: string }
): Promise<boolean> {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return false;
  }

  const text = [
    "New Portfolio Contact Message",
    `From: ${payload.name} (${payload.email})`,
    `ID: ${payload.id}`,
    `Time: ${payload.createdAt}`,
    "",
    payload.message,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function mapMessage(row: ContactRow, replies: ReplyRow[]) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    replies: replies.map((r) => ({
      id: r.id,
      messageId: r.message_id,
      body: r.body,
      createdAt: r.created_at,
    })),
  };
}

export async function handleRequest(
  request: Request,
  env: WorkerEnv
): Promise<Response> {
  const cors = getCorsHeaders(request, env);
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // Health check
  if (request.method === "GET" && path === "/api/health") {
    return jsonResponse({ ok: true }, 200, cors);
  }

  // Public contact submission -> D1 + Telegram notification
  if (request.method === "POST" && path === "/api/contact") {
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400, cors);
    }

    // Honeypot check
    if (typeof body.company === "string" && body.company.trim().length > 0) {
      return jsonResponse({ ok: false, error: "Invalid submission." }, 400, cors);
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (name.length < 2 || name.length > 100) {
      return jsonResponse(
        { ok: false, error: "Name must be between 2 and 100 characters." },
        400,
        cors
      );
    }
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return jsonResponse(
        { ok: false, error: "Please provide a valid email address." },
        400,
        cors
      );
    }
    if (message.length < 10 || message.length > 5000) {
      return jsonResponse(
        { ok: false, error: "Message must be between 10 and 5000 characters." },
        400,
        cors
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    try {
      const result = await env.DB.prepare(
        `INSERT INTO contact_messages (id, name, email, message, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'New', ?, ?)`
      )
        .bind(id, name, email, message, now, now)
        .run();

      if (!result.success) {
        return jsonResponse(
          { ok: false, error: "Failed to persist message in database." },
          500,
          cors
        );
      }
    } catch {
      return jsonResponse(
        { ok: false, error: "Database error while saving message." },
        500,
        cors
      );
    }

    // Trigger Telegram notification (D1 remains source of truth)
    await sendTelegramNotification(env, {
      id,
      name,
      email,
      message,
      createdAt: now,
    });

    return jsonResponse({ ok: true, id, createdAt: now }, 201, cors);
  }

  // Admin auth verification endpoint
  if (request.method === "POST" && path === "/api/admin/auth") {
    const body = await parseJsonBody(request);
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const expected = env.ADMIN_TOKEN?.trim();

    if (!expected || !token || !timingSafeEqual(token, expected)) {
      return jsonResponse({ ok: false, error: "Unauthorized." }, 401, cors);
    }
    return jsonResponse({ ok: true }, 200, cors);
  }

  // Protect all remaining /api/admin/* routes
  if (path.startsWith("/api/admin")) {
    if (!isAuthorized(request, env)) {
      return jsonResponse({ ok: false, error: "Unauthorized." }, 401, cors);
    }

    // GET /api/admin/messages
    if (request.method === "GET" && path === "/api/admin/messages") {
      try {
        const msgResult = await env.DB.prepare(
          `SELECT id, name, email, message, status, created_at, updated_at
           FROM contact_messages
           ORDER BY created_at DESC`
        ).all<ContactRow>();

        const replyResult = await env.DB.prepare(
          `SELECT id, message_id, client_reply_id, body, created_at
           FROM admin_replies
           ORDER BY created_at ASC`
        ).all<ReplyRow>();

        const repliesByMessage = new Map<string, ReplyRow[]>();
        for (const r of replyResult.results) {
          const list = repliesByMessage.get(r.message_id) || [];
          list.push(r);
          repliesByMessage.set(r.message_id, list);
        }

        const data = msgResult.results.map((row) =>
          mapMessage(row, repliesByMessage.get(row.id) || [])
        );

        return jsonResponse({ ok: true, data }, 200, cors);
      } catch {
        return jsonResponse(
          { ok: false, error: "Failed to load messages from database." },
          500,
          cors
        );
      }
    }

    // GET /api/admin/messages/:id
    const singleMatch = path.match(/^\/api\/admin\/messages\/([^/]+)$/);
    if (request.method === "GET" && singleMatch) {
      const id = decodeURIComponent(singleMatch[1]);
      try {
        const row = await env.DB.prepare(
          `SELECT id, name, email, message, status, created_at, updated_at
           FROM contact_messages WHERE id = ?`
        )
          .bind(id)
          .first<ContactRow>();

        if (!row) {
          return jsonResponse({ ok: false, error: "Message not found." }, 404, cors);
        }

        const replies = await env.DB.prepare(
          `SELECT id, message_id, client_reply_id, body, created_at
           FROM admin_replies WHERE message_id = ? ORDER BY created_at ASC`
        )
          .bind(id)
          .all<ReplyRow>();

        return jsonResponse(
          { ok: true, data: mapMessage(row, replies.results) },
          200,
          cors
        );
      } catch {
        return jsonResponse(
          { ok: false, error: "Failed to fetch message." },
          500,
          cors
        );
      }
    }

    // POST /api/admin/messages/:id/replies
    const replyMatch = path.match(/^\/api\/admin\/messages\/([^/]+)\/replies$/);
    if (request.method === "POST" && replyMatch) {
      const messageId = decodeURIComponent(replyMatch[1]);
      const body = await parseJsonBody(request);
      if (!body) {
        return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400, cors);
      }

      const replyText = typeof body.body === "string" ? body.body.trim() : "";
      const clientReplyId =
        typeof body.clientReplyId === "string" && body.clientReplyId.trim()
          ? body.clientReplyId.trim().slice(0, 100)
          : null;

      if (replyText.length < 1 || replyText.length > 5000) {
        return jsonResponse(
          { ok: false, error: "Reply must be between 1 and 5000 characters." },
          400,
          cors
        );
      }

      try {
        const existingMsg = await env.DB.prepare(
          `SELECT id, status FROM contact_messages WHERE id = ?`
        )
          .bind(messageId)
          .first<{ id: string; status: MessageStatus }>();

        if (!existingMsg) {
          return jsonResponse({ ok: false, error: "Message not found." }, 404, cors);
        }

        if (clientReplyId) {
          const duplicate = await env.DB.prepare(
            `SELECT id, message_id, client_reply_id, body, created_at
             FROM admin_replies WHERE message_id = ? AND client_reply_id = ?`
          )
            .bind(messageId, clientReplyId)
            .first<ReplyRow>();

          if (duplicate) {
            return jsonResponse(
              {
                ok: true,
                data: {
                  reply: {
                    id: duplicate.id,
                    messageId: duplicate.message_id,
                    body: duplicate.body,
                    createdAt: duplicate.created_at,
                  },
                  status: existingMsg.status,
                },
              },
              200,
              cors
            );
          }
        }

        const replyId = crypto.randomUUID();
        const now = new Date().toISOString();
        const nextStatus: MessageStatus =
          existingMsg.status === "New" ? "Replied" : existingMsg.status;

        await env.DB.batch([
          env.DB.prepare(
            `INSERT INTO admin_replies (id, message_id, client_reply_id, body, created_at)
             VALUES (?, ?, ?, ?, ?)`
          ).bind(replyId, messageId, clientReplyId, replyText, now),
          env.DB.prepare(
            `UPDATE contact_messages SET status = ?, updated_at = ? WHERE id = ?`
          ).bind(nextStatus, now, messageId),
        ]);

        return jsonResponse(
          {
            ok: true,
            data: {
              reply: {
                id: replyId,
                messageId,
                body: replyText,
                createdAt: now,
              },
              status: nextStatus,
            },
          },
          201,
          cors
        );
      } catch {
        return jsonResponse(
          { ok: false, error: "Failed to save reply." },
          500,
          cors
        );
      }
    }

    // PATCH /api/admin/messages/:id/status
    const statusMatch = path.match(/^\/api\/admin\/messages\/([^/]+)\/status$/);
    if (request.method === "PATCH" && statusMatch) {
      const messageId = decodeURIComponent(statusMatch[1]);
      const body = await parseJsonBody(request);
      const status = body?.status as MessageStatus;

      if (!VALID_STATUSES.has(status)) {
        return jsonResponse(
          { ok: false, error: "Status must be New, Replied, or Closed." },
          400,
          cors
        );
      }

      try {
        const now = new Date().toISOString();
        const result = await env.DB.prepare(
          `UPDATE contact_messages SET status = ?, updated_at = ? WHERE id = ?`
        )
          .bind(status, now, messageId)
          .run();

        if (!result.success || (result.meta?.changes ?? 0) === 0) {
          return jsonResponse({ ok: false, error: "Message not found." }, 404, cors);
        }

        return jsonResponse(
          { ok: true, data: { id: messageId, status, updatedAt: now } },
          200,
          cors
        );
      } catch {
        return jsonResponse(
          { ok: false, error: "Failed to update message status." },
          500,
          cors
        );
      }
    }

    // DELETE /api/admin/messages/:id
    if (request.method === "DELETE" && singleMatch) {
      const messageId = decodeURIComponent(singleMatch[1]);
      try {
        // Delete replies first in case PRAGMA foreign_keys is off in a given D1 session
        await env.DB.batch([
          env.DB.prepare(`DELETE FROM admin_replies WHERE message_id = ?`).bind(
            messageId
          ),
          env.DB.prepare(`DELETE FROM contact_messages WHERE id = ?`).bind(
            messageId
          ),
        ]);

        return jsonResponse({ ok: true, data: { id: messageId } }, 200, cors);
      } catch {
        return jsonResponse(
          { ok: false, error: "Failed to delete message." },
          500,
          cors
        );
      }
    }
  }

  return jsonResponse({ ok: false, error: "Not found." }, 404, cors);
}

const worker = {
  fetch(request: Request, env: WorkerEnv): Promise<Response> {
    return handleRequest(request, env);
  },
};

export default worker;
