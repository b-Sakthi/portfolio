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

export interface RateLimitBindingLike {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface WorkerEnv {
  DB: D1DatabaseLike;
  ADMIN_TOKEN?: string;
  SESSION_SECRET?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGINS?: string;
  CONTACT_LIMITER?: RateLimitBindingLike;
  ADMIN_AUTH_LIMITER?: RateLimitBindingLike;
  ADMIN_WRITE_LIMITER?: RateLimitBindingLike;
  PUBLIC_LIMITER?: RateLimitBindingLike;
}

type MessageStatus = "New" | "Replied" | "Closed";

const VALID_STATUSES = new Set<MessageStatus>(["New", "Replied", "Closed"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 16_384; // 16 KB strict payload limit
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours
const SESSION_COOKIE_NAME = "admin_session";

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

function logSecurityEvent(
  event: string,
  details: { method: string; path: string; status: number; reason: string }
): void {
  // Structured security logging without PII, message contents, or credentials
  console.warn(
    JSON.stringify({
      type: "security_event",
      event,
      ...details,
      timestamp: new Date().toISOString(),
    })
  );
}

function getAllowedOrigins(env: WorkerEnv): Set<string> {
  const raw = env.ALLOWED_ORIGINS || "https://sakthib.pages.dev,http://localhost:3000";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s !== "*")
  );
}

function getTrustedClientIp(request: Request): string {
  // Never trust X-Forwarded-For; rely strictly on Cloudflare's CF-Connecting-IP
  return request.headers.get("CF-Connecting-IP")?.trim() || "local-dev";
}

function getCorsHeaders(
  origin: string | null,
  allowedOrigins: Set<string>
): Record<string, string> {
  const base: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && allowedOrigins.has(origin)) {
    base["Access-Control-Allow-Origin"] = origin;
  }

  return base;
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function constantTimeSecretMatch(
  provided: string,
  expected: string
): Promise<boolean> {
  // Hash both inputs to fixed-length 256-bit digests before constant-time comparison
  const [aHash, bHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(provided)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected)),
  ]);
  const a = new Uint8Array(aHash);
  const b = new Uint8Array(bHash);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array<ArrayBuffer> | null {
  try {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (str.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signAdminSession(env: WorkerEnv): Promise<string | null> {
  const secret = (env.SESSION_SECRET || env.ADMIN_TOKEN)?.trim();
  if (!secret) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    iat: nowSec,
    exp: nowSec + SESSION_TTL_SECONDS,
    nonce: crypto.randomUUID(),
  });
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload));
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  return `${payloadB64}.${toBase64Url(new Uint8Array(sig))}`;
}

async function verifyAdminSessionCookie(
  cookieToken: string,
  env: WorkerEnv
): Promise<boolean> {
  const secret = (env.SESSION_SECRET || env.ADMIN_TOKEN)?.trim();
  if (!secret) return false;

  const parts = cookieToken.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  const sigBytes = fromBase64Url(sigB64);
  const payloadBytes = fromBase64Url(payloadB64);
  if (!sigBytes || !payloadBytes) return false;

  const key = await getHmacKey(secret);
  const validSig = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(payloadB64)
  );
  if (!validSig) return false;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      exp?: number;
    };
    const nowSec = Math.floor(Date.now() / 1000);
    return typeof parsed.exp === "number" && parsed.exp > nowSec;
  } catch {
    return false;
  }
}

function parseCookies(header: string | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!header) return map;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (key) map.set(key, val);
  }
  return map;
}

async function isAdminAuthenticated(
  request: Request,
  env: WorkerEnv
): Promise<boolean> {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
  if (sessionCookie && (await verifyAdminSessionCookie(sessionCookie, env))) {
    return true;
  }

  // Fallback Bearer token check for non-browser API clients (never used by frontend)
  const expected = env.ADMIN_TOKEN?.trim();
  const authHeader = request.headers.get("Authorization") || "";
  if (expected && authHeader.startsWith("Bearer ")) {
    const provided = authHeader.slice(7).trim();
    if (provided && (await constantTimeSecretMatch(provided, expected))) {
      return true;
    }
  }

  return false;
}

function buildSessionCookieHeader(
  requestUrl: URL,
  value: string,
  maxAge: number
): string {
  const isLocalHttp =
    requestUrl.protocol === "http:" &&
    (requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1");

  const attrs = [
    `${SESSION_COOKIE_NAME}=${value}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${maxAge}`,
    isLocalHttp ? "SameSite=Lax" : "SameSite=None",
  ];
  if (!isLocalHttp) {
    attrs.push("Secure");
  }
  return attrs.join("; ");
}

async function enforceRateLimit(
  limiter: RateLimitBindingLike | undefined,
  key: string
): Promise<boolean> {
  if (!limiter) return true;
  const result = await limiter.limit({ key });
  return result.success;
}

type JsonParseResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: number; error: string };

async function parseJsonRequest(request: Request): Promise<JsonParseResult> {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      status: 415,
      error: "Content-Type must be application/json.",
    };
  }

  const contentLength = request.headers.get("Content-Length");
  if (contentLength) {
    const len = Number(contentLength);
    if (Number.isFinite(len) && len > MAX_BODY_BYTES) {
      return {
        ok: false,
        status: 413,
        error: "Request payload exceeds maximum allowed size.",
      };
    }
  }

  let rawText = "";
  try {
    rawText = await request.text();
  } catch {
    return { ok: false, status: 400, error: "Unable to read request body." };
  }

  if (new TextEncoder().encode(rawText).byteLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      status: 413,
      error: "Request payload exceeds maximum allowed size.",
    };
  }

  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, status: 400, error: "Invalid JSON payload." };
    }
    return { ok: true, data: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, status: 400, error: "Malformed JSON payload." };
  }
}

async function verifyTurnstileToken(
  env: WorkerEnv,
  token: string,
  clientIp: string
): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token.trim()) return false;

  try {
    const form = new URLSearchParams({
      secret,
      response: token.trim(),
    });
    if (clientIp !== "local-dev") {
      form.set("remoteip", clientIp);
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      }
    );
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    return false;
  }
}

async function sendTelegramNotification(
  env: WorkerEnv,
  payload: {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
  }
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
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const origin = request.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);
  const cors = getCorsHeaders(origin, allowedOrigins);
  const clientIp = getTrustedClientIp(request);

  // Reject disallowed browser origins explicitly
  if (origin && !allowedOrigins.has(origin)) {
    logSecurityEvent("cors_origin_rejected", {
      method: request.method,
      path,
      status: 403,
      reason: "Origin not in allowlist",
    });
    return jsonResponse({ ok: false, error: "Forbidden origin." }, 403, {});
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // Health check
  if (path === "/api/health") {
    if (request.method !== "GET") {
      return jsonResponse(
        { ok: false, error: "Method not allowed." },
        405,
        cors,
        { Allow: "GET, OPTIONS" }
      );
    }
    const allowed = await enforceRateLimit(env.PUBLIC_LIMITER, clientIp);
    if (!allowed) {
      return jsonResponse(
        { ok: false, error: "Too many requests." },
        429,
        cors,
        { "Retry-After": "60" }
      );
    }
    return jsonResponse({ ok: true }, 200, cors);
  }

  // Public contact submission -> validation + rate limit + dedup + D1 + Telegram
  if (path === "/api/contact") {
    if (request.method !== "POST") {
      return jsonResponse(
        { ok: false, error: "Method not allowed." },
        405,
        cors,
        { Allow: "POST, OPTIONS" }
      );
    }

    const allowed = await enforceRateLimit(env.CONTACT_LIMITER, clientIp);
    if (!allowed) {
      logSecurityEvent("contact_rate_limited", {
        method: request.method,
        path,
        status: 429,
        reason: "Contact rate limit exceeded",
      });
      return jsonResponse(
        { ok: false, error: "Too many submissions. Please try again shortly." },
        429,
        cors,
        { "Retry-After": "60" }
      );
    }

    const parsed = await parseJsonRequest(request);
    if (!parsed.ok) {
      logSecurityEvent("contact_invalid_payload", {
        method: request.method,
        path,
        status: parsed.status,
        reason: parsed.error,
      });
      return jsonResponse({ ok: false, error: parsed.error }, parsed.status, cors);
    }
    const body = parsed.data;

    // Honeypot check
    if (typeof body.company === "string" && body.company.trim().length > 0) {
      logSecurityEvent("honeypot_triggered", {
        method: request.method,
        path,
        status: 400,
        reason: "Honeypot field populated",
      });
      return jsonResponse({ ok: false, error: "Invalid submission." }, 400, cors);
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const turnstileToken =
      typeof body.turnstileToken === "string" ? body.turnstileToken : "";

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

    if (env.TURNSTILE_SECRET_KEY) {
      const turnstileOk = await verifyTurnstileToken(
        env,
        turnstileToken,
        clientIp
      );
      if (!turnstileOk) {
        logSecurityEvent("turnstile_failed", {
          method: request.method,
          path,
          status: 403,
          reason: "Turnstile verification failed",
        });
        return jsonResponse(
          { ok: false, error: "Bot verification failed." },
          403,
          cors
        );
      }
    }

    const submissionHash = await sha256Hex(
      `${email.toLowerCase()}|${message}`
    );
    const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();

    try {
      const duplicate = await env.DB.prepare(
        `SELECT id FROM contact_messages
         WHERE submission_hash = ? AND created_at >= ?`
      )
        .bind(submissionHash, windowStart)
        .first<{ id: string }>();

      if (duplicate) {
        return jsonResponse(
          {
            ok: false,
            error:
              "Duplicate submission detected. Please wait before sending the same message again.",
          },
          409,
          cors
        );
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const result = await env.DB.prepare(
        `INSERT INTO contact_messages (id, name, email, message, submission_hash, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'New', ?, ?)`
      )
        .bind(id, name, email, message, submissionHash, now, now)
        .run();

      if (!result.success) {
        return jsonResponse(
          { ok: false, error: "Unable to save message right now." },
          500,
          cors
        );
      }

      await sendTelegramNotification(env, {
        id,
        name,
        email,
        message,
        createdAt: now,
      });

      return jsonResponse({ ok: true, id, createdAt: now }, 201, cors);
    } catch (err) {
      console.error("D1 contact insert error:", err);
      return jsonResponse(
        { ok: false, error: "Internal server error." },
        500,
        cors
      );
    }
  }

  // Admin Login -> sets HttpOnly HMAC-signed cookie
  if (path === "/api/admin/auth") {
    if (request.method !== "POST") {
      return jsonResponse(
        { ok: false, error: "Method not allowed." },
        405,
        cors,
        { Allow: "POST, OPTIONS" }
      );
    }

    const allowed = await enforceRateLimit(env.ADMIN_AUTH_LIMITER, clientIp);
    if (!allowed) {
      logSecurityEvent("admin_auth_rate_limited", {
        method: request.method,
        path,
        status: 429,
        reason: "Admin auth rate limit exceeded",
      });
      return jsonResponse(
        { ok: false, error: "Too many login attempts. Please try again later." },
        429,
        cors,
        { "Retry-After": "60" }
      );
    }

    const parsed = await parseJsonRequest(request);
    if (!parsed.ok) {
      return jsonResponse({ ok: false, error: parsed.error }, parsed.status, cors);
    }

    const token =
      typeof parsed.data.token === "string" ? parsed.data.token.trim() : "";
    const expected = env.ADMIN_TOKEN?.trim();

    if (
      !expected ||
      !token ||
      !(await constantTimeSecretMatch(token, expected))
    ) {
      logSecurityEvent("admin_auth_failed", {
        method: request.method,
        path,
        status: 401,
        reason: "Invalid credentials",
      });
      return jsonResponse({ ok: false, error: "Invalid credentials." }, 401, cors);
    }

    const sessionToken = await signAdminSession(env);
    if (!sessionToken) {
      return jsonResponse(
        { ok: false, error: "Authentication configuration error." },
        500,
        cors
      );
    }

    return jsonResponse({ ok: true }, 200, cors, {
      "Set-Cookie": buildSessionCookieHeader(url, sessionToken, SESSION_TTL_SECONDS),
    });
  }

  // Admin Logout -> clears HttpOnly cookie
  if (path === "/api/admin/logout") {
    if (request.method !== "POST") {
      return jsonResponse(
        { ok: false, error: "Method not allowed." },
        405,
        cors,
        { Allow: "POST, OPTIONS" }
      );
    }
    return jsonResponse({ ok: true }, 200, cors, {
      "Set-Cookie": buildSessionCookieHeader(url, "", 0),
    });
  }

  // Protected Admin Routes
  if (path.startsWith("/api/admin")) {
    const authed = await isAdminAuthenticated(request, env);
    if (!authed) {
      logSecurityEvent("admin_unauthenticated", {
        method: request.method,
        path,
        status: 401,
        reason: "Missing or invalid session",
      });
      return jsonResponse({ ok: false, error: "Unauthorized." }, 401, cors);
    }

    // CSRF protection for state-changing admin mutations
    if (
      request.method === "POST" ||
      request.method === "PATCH" ||
      request.method === "DELETE"
    ) {
      if (!origin || !allowedOrigins.has(origin)) {
        logSecurityEvent("csrf_rejected", {
          method: request.method,
          path,
          status: 403,
          reason: "Missing or untrusted Origin header on mutation",
        });
        return jsonResponse(
          { ok: false, error: "Forbidden: invalid request origin." },
          403,
          cors
        );
      }

      const writeAllowed = await enforceRateLimit(
        env.ADMIN_WRITE_LIMITER,
        "admin-write"
      );
      if (!writeAllowed) {
        logSecurityEvent("admin_write_rate_limited", {
          method: request.method,
          path,
          status: 429,
          reason: "Admin write rate limit exceeded",
        });
        return jsonResponse(
          { ok: false, error: "Too many admin write operations." },
          429,
          cors,
          { "Retry-After": "60" }
        );
      }
    }

    // GET /api/admin/session
    if (path === "/api/admin/session") {
      if (request.method !== "GET") {
        return jsonResponse(
          { ok: false, error: "Method not allowed." },
          405,
          cors,
          { Allow: "GET, OPTIONS" }
        );
      }
      return jsonResponse({ ok: true }, 200, cors);
    }

    // GET /api/admin/messages
    if (path === "/api/admin/messages") {
      if (request.method !== "GET") {
        return jsonResponse(
          { ok: false, error: "Method not allowed." },
          405,
          cors,
          { Allow: "GET, OPTIONS" }
        );
      }
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
      } catch (err) {
        console.error("D1 list messages error:", err);
        return jsonResponse(
          { ok: false, error: "Internal server error." },
          500,
          cors
        );
      }
    }

    // /api/admin/messages/:id/replies
    const replyMatch = path.match(/^\/api\/admin\/messages\/([^/]+)\/replies$/);
    if (replyMatch) {
      if (request.method !== "POST") {
        return jsonResponse(
          { ok: false, error: "Method not allowed." },
          405,
          cors,
          { Allow: "POST, OPTIONS" }
        );
      }

      const messageId = decodeURIComponent(replyMatch[1]);
      if (!UUID_REGEX.test(messageId)) {
        return jsonResponse({ ok: false, error: "Invalid message ID." }, 400, cors);
      }

      const parsed = await parseJsonRequest(request);
      if (!parsed.ok) {
        return jsonResponse({ ok: false, error: parsed.error }, parsed.status, cors);
      }

      const replyText =
        typeof parsed.data.body === "string" ? parsed.data.body.trim() : "";
      const clientReplyId =
        typeof parsed.data.clientReplyId === "string" &&
        parsed.data.clientReplyId.trim()
          ? parsed.data.clientReplyId.trim().slice(0, 100)
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
      } catch (err) {
        console.error("D1 reply error:", err);
        return jsonResponse(
          { ok: false, error: "Internal server error." },
          500,
          cors
        );
      }
    }

    // /api/admin/messages/:id/status
    const statusMatch = path.match(/^\/api\/admin\/messages\/([^/]+)\/status$/);
    if (statusMatch) {
      if (request.method !== "PATCH") {
        return jsonResponse(
          { ok: false, error: "Method not allowed." },
          405,
          cors,
          { Allow: "PATCH, OPTIONS" }
        );
      }

      const messageId = decodeURIComponent(statusMatch[1]);
      if (!UUID_REGEX.test(messageId)) {
        return jsonResponse({ ok: false, error: "Invalid message ID." }, 400, cors);
      }

      const parsed = await parseJsonRequest(request);
      if (!parsed.ok) {
        return jsonResponse({ ok: false, error: parsed.error }, parsed.status, cors);
      }

      const status = parsed.data.status as MessageStatus;
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
      } catch (err) {
        console.error("D1 status error:", err);
        return jsonResponse(
          { ok: false, error: "Internal server error." },
          500,
          cors
        );
      }
    }

    // /api/admin/messages/:id (GET or DELETE)
    const singleMatch = path.match(/^\/api\/admin\/messages\/([^/]+)$/);
    if (singleMatch) {
      const messageId = decodeURIComponent(singleMatch[1]);
      if (!UUID_REGEX.test(messageId)) {
        return jsonResponse({ ok: false, error: "Invalid message ID." }, 400, cors);
      }

      if (request.method === "GET") {
        try {
          const row = await env.DB.prepare(
            `SELECT id, name, email, message, status, created_at, updated_at
             FROM contact_messages WHERE id = ?`
          )
            .bind(messageId)
            .first<ContactRow>();

          if (!row) {
            return jsonResponse(
              { ok: false, error: "Message not found." },
              404,
              cors
            );
          }

          const replies = await env.DB.prepare(
            `SELECT id, message_id, client_reply_id, body, created_at
             FROM admin_replies WHERE message_id = ? ORDER BY created_at ASC`
          )
            .bind(messageId)
            .all<ReplyRow>();

          return jsonResponse(
            { ok: true, data: mapMessage(row, replies.results) },
            200,
            cors
          );
        } catch (err) {
          console.error("D1 get message error:", err);
          return jsonResponse(
            { ok: false, error: "Internal server error." },
            500,
            cors
          );
        }
      }

      if (request.method === "DELETE") {
        try {
          const existing = await env.DB.prepare(
            `SELECT id, status FROM contact_messages WHERE id = ?`
          )
            .bind(messageId)
            .first<{ id: string; status: MessageStatus }>();

          if (!existing) {
            return jsonResponse(
              { ok: false, error: "Message not found." },
              404,
              cors
            );
          }

          await env.DB.batch([
            env.DB.prepare(`DELETE FROM admin_replies WHERE message_id = ?`).bind(
              messageId
            ),
            env.DB.prepare(`DELETE FROM contact_messages WHERE id = ?`).bind(
              messageId
            ),
          ]);

          return jsonResponse({ ok: true, data: { id: messageId } }, 200, cors);
        } catch (err) {
          console.error("D1 delete error:", err);
          return jsonResponse(
            { ok: false, error: "Internal server error." },
            500,
            cors
          );
        }
      }

      return jsonResponse(
        { ok: false, error: "Method not allowed." },
        405,
        cors,
        { Allow: "GET, DELETE, OPTIONS" }
      );
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
